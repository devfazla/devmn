import { useEffect, useState } from 'react';

const THEME_CLASSES = [
  'neo-brutalism',
  'neumorphism',
  'glassmorphism',
  'material',
  'claymorphism',
];

// Applies the selected theme class to <body> and persists the choice in localStorage.
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('selectedTheme') || 'default'
  );

  useEffect(() => {
    const body = document.body;
    body.classList.remove(...THEME_CLASSES);
    if (theme !== 'default') {
      body.classList.add(theme);
    }
    localStorage.setItem('selectedTheme', theme);
  }, [theme]);

  return [theme, setTheme];
}

// Observes every .fade-in element and adds .visible when it scrolls into view.
export function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function normalizePath(path) {
  return path.replace(/\/+$/g, '') || '/';
}

// Tiny parser for the flat routes.yml config (key: value / key + "- item" lists).
function parseYamlConfig(yamlText) {
  const config = {};
  let currentKey = null;

  yamlText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const arrayMatch = trimmed.match(/^-\s*(.*)$/);
    if (arrayMatch && currentKey) {
      config[currentKey].push(arrayMatch[1]);
      return;
    }

    const kvMatch = trimmed.match(/^([\w-]+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === '') {
        config[key] = [];
        currentKey = key;
      } else {
        currentKey = null;
        config[key] = value;
      }
    }
  });

  return config;
}

function loadRouteConfig() {
  return fetch('routes.yml', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Route config not available');
      return response.text();
    })
    .then((text) => parseYamlConfig(text))
    .catch(() => ({
      basePath: '/',
      homeUrl: '/',
      routes: ['/', '/index.html', '/index'],
    }));
}

// Mirrors the original 404 route handling: if the current path is not listed
// in routes.yml, show the not-found section instead of the main content.
export function useRouteNotFound() {
  const [notFound, setNotFound] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let active = true;

    loadRouteConfig().then((routeConfig) => {
      if (!active) return;
      setConfig(routeConfig);

      const currentPath = normalizePath(location.pathname);
      const validRoutes = new Set((routeConfig.routes || []).map(normalizePath));
      if (routeConfig.basePath) validRoutes.add(normalizePath(routeConfig.basePath));
      if (routeConfig.homeUrl) validRoutes.add(normalizePath(routeConfig.homeUrl));

      setNotFound(!validRoutes.has(currentPath));
    });

    return () => {
      active = false;
    };
  }, []);

  const goHome = () => {
    window.location.href = normalizePath((config && config.homeUrl) || '/');
  };

  return { notFound, goHome };
}
