// Central SEO config + runtime head sync.
// The static tags live in index.html (so crawlers see them without JS);
// this module only overrides them when the rendered view differs, e.g. the 404.
import { useEffect } from 'react';

export const SITE = {
  // Single source of truth for absolute URLs used in canonical/OG/sitemap.
  url: 'https://devfazla.com',
  name: 'Fazla Rabbi',
  defaultTitle: 'Fazla Rabbi - Software Developer | Android, Flutter & Web',
  defaultDescription:
    'Fazla Rabbi is a software developer building Android (Java/Kotlin), Flutter and cross-platform apps, plus modern websites and UI/UX design.',
  ogImage: '/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

function upsertMeta(selector, attribute, key, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

// Applies a page title/description, keeps canonical + social cards in sync and
// controls indexing for views that should never appear in search results.
export function useSeo({ title, description, path = '/', indexable = true } = {}) {
  const finalTitle = title || SITE.defaultTitle;
  const finalDescription = description || SITE.defaultDescription;
  const robots = indexable
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, follow';

  useEffect(() => {
    document.title = finalTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', finalDescription);
    upsertMeta('meta[name="robots"]', 'name', 'robots', robots);
    upsertMeta('meta[name="googlebot"]', 'name', 'googlebot', robots);

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', finalDescription);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', SITE.url + path);

    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription);

    // Always canonicalise to the production domain, never to a preview host.
    upsertLink('canonical', SITE.url + path);
  }, [finalTitle, finalDescription, path, robots]);
}
