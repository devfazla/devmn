import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import ThemeWidget from './components/ThemeWidget';
import { useFadeIn, useRouteNotFound, useTheme } from './hooks';
import { useSeo } from './seo';

export default function App() {
  const [theme, setTheme] = useTheme();
  const { notFound, goHome } = useRouteNotFound();

  useFadeIn();

  // The homepage keeps the static tags from index.html; any other path is the
  // in-app 404 view, which gets its own title, a noindex directive and a
  // self-referential canonical (a soft-404 must not canonicalise to the home page).
  useSeo(
    notFound
      ? {
          title: '404 - Page Not Found | Fazla Rabbi',
          description:
            'The page you requested does not exist on devfazla.com. Return to the homepage to browse projects and contact details.',
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          indexable: false,
        }
      : { path: '/' }
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main">
        {notFound ? (
          <NotFound onGoHome={goHome} />
        ) : (
          <>
            <Hero />
            <Skills />
            <Projects />
            <About />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      {/* Global theme picker - lives outside the page flow so it is available
          on every route (including the in-app 404 view). */}
      <ThemeWidget theme={theme} setTheme={setTheme} />
    </>
  );
}
