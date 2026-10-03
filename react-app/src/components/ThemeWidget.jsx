import { useEffect, useRef, useState } from 'react';
import { themes } from '../data';

const EDGE_MARGIN = 18;
const SIZE = 56; // widget diameter in px (keep in sync with .theme-widget)
const DRAG_THRESHOLD = 6; // px moved before a press becomes a drag
const POS_KEY = 'themeWidgetPos';
const USED_KEY = 'themeWidgetUsed';

function loadPos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const { x, y } = JSON.parse(raw);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  } catch {
    // corrupted storage - fall back to the default corner
  }
  return null;
}

function defaultPos() {
  return {
    x: window.innerWidth - SIZE - EDGE_MARGIN,
    y: window.innerHeight - SIZE - EDGE_MARGIN,
  };
}

function clampPos(pos) {
  const maxX = window.innerWidth - SIZE - EDGE_MARGIN;
  const maxY = window.innerHeight - SIZE - EDGE_MARGIN;
  return {
    x: Math.min(Math.max(EDGE_MARGIN, pos.x), Math.max(EDGE_MARGIN, maxX)),
    y: Math.min(Math.max(EDGE_MARGIN, pos.y), Math.max(EDGE_MARGIN, maxY)),
  };
}

// Global floating theme picker.
// - Collapsed: a single palette button with a periodic shine sweep that stops
//   forever after the first use (and under prefers-reduced-motion).
// - Expanded: hover (mouse) or tap/click (touch) reveals the theme options;
//   selecting a theme, clicking outside or pressing Escape collapses it again.
// - Draggable anywhere on the page; the position survives reloads.
export default function ThemeWidget({ theme, setTheme }) {
  const [pos, setPos] = useState(() => {
    const stored = loadPos();
    return clampPos(stored || defaultPos());
  });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(() => localStorage.getItem(USED_KEY) === '1');

  const shellRef = useRef(null);
  const triggerRef = useRef(null);
  // Live drag bookkeeping kept out of React state so pointermove never
  // re-renders the tree - the element is moved via transform instead.
  const drag = useRef({ active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0, moved: false });
  const justDragged = useRef(false);

  // Keep the widget inside the viewport when the window is resized.
  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Click outside collapses the panel (outside = anywhere but this widget).
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  const markUsed = () => {
    if (localStorage.getItem(USED_KEY) !== '1') {
      localStorage.setItem(USED_KEY, '1');
    }
    setUsed(true);
  };

  const handlePointerDown = (event) => {
    // Interactive children (trigger, theme buttons) never start a drag.
    if (event.target.closest('[data-no-drag]')) return;
    const d = drag.current;
    d.active = true;
    d.id = event.pointerId;
    d.ox = event.clientX;
    d.oy = event.clientY;
    d.dx = 0;
    d.dy = 0;
    d.moved = false;
  };

  const handlePointerMove = (event) => {
    const d = drag.current;
    if (!d.active || event.pointerId !== d.id || !pos || !shellRef.current) return;

    const dx = event.clientX - d.ox;
    const dy = event.clientY - d.oy;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!d.moved) {
      // First real movement: enter drag mode (transition off, panel closed).
      d.moved = true;
      setDragging(true);
      setOpen(false);
      shellRef.current.setPointerCapture?.(d.id);
    }

    const maxX = window.innerWidth - SIZE - EDGE_MARGIN;
    const maxY = window.innerHeight - SIZE - EDGE_MARGIN;
    d.dx = Math.min(Math.max(dx, EDGE_MARGIN - pos.x), maxX - pos.x);
    d.dy = Math.min(Math.max(dy, EDGE_MARGIN - pos.y), maxY - pos.y);
    shellRef.current.style.transform = `translate(${d.dx}px, ${d.dy}px)`;
  };

  const endDrag = (event) => {
    const d = drag.current;
    if (!d.active || (event && event.pointerId !== d.id)) return;
    d.active = false;
    if (!d.moved) return;

    const next = clampPos({ x: pos.x + d.dx, y: pos.y + d.dy });
    d.moved = false;
    d.dx = 0;
    d.dy = 0;
    if (shellRef.current) shellRef.current.style.transform = '';
    setDragging(false);
    setPos(next);
    localStorage.setItem(POS_KEY, JSON.stringify(next));
    // Swallow the click that follows pointerup after a drag.
    justDragged.current = true;
    setTimeout(() => {
      justDragged.current = false;
    }, 150);
  };

  const handleShellClick = (event) => {
    if (justDragged.current) return;
    // Theme selection is handled by the button itself; don't double-toggle.
    if (event.target.closest('.theme-btn')) return;
    markUsed();
    setOpen((o) => !o);
  };

  const handlePointerEnter = (event) => {
    // Hover-expand only for a real mouse; touch/pen relies on tap + outside-click.
    if (event.pointerType === 'mouse') setOpen(true);
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType === 'mouse' && !drag.current.active) setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleSelect = (id) => {
    markUsed();
    setTheme(id);
    setOpen(false);
  };

  if (!pos) return null;

  // Flip the panel below the button when the widget sits in the top half.
  const flip = pos.y < window.innerHeight / 2;

  return (
    <div
      ref={shellRef}
      className={`theme-widget${open ? ' open' : ''}${dragging ? ' dragging' : ''}${
        flip ? ' flip' : ''
      }`}
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      role="group"
      aria-label="Theme picker (drag to move)"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={handleShellClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      <div className={`theme-widget-shine${used ? ' off' : ''}`} aria-hidden="true"></div>
      <button
        ref={triggerRef}
        type="button"
        className="theme-widget-trigger"
        data-no-drag
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Choose colour theme"
      >
        <i className="fas fa-palette" aria-hidden="true"></i>
      </button>

      <div className="theme-widget-panel" id="theme-selector" role="group" aria-label="Colour theme">
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`theme-btn${theme === t.id ? ' active' : ''}`}
            data-theme={t.id}
            data-no-drag
            tabIndex={open ? 0 : -1}
            aria-pressed={theme === t.id}
            onClick={() => handleSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
