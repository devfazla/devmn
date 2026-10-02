# Project Structure

Repository tree for **devfazla.com** — the Fazla Rabbi portfolio.

The React/Vite app in `react-app/` is the single production source. GitHub Actions
(`.github/workflows/deploy.yml`) builds it and publishes `react-app/dist/` to GitHub
Pages on the custom domain `devfazla.com`.

Legacy static-site files that lived at the repo root (`index.html`, `CNAME`,
`routes.yml`, `images/`) were removed once `react-app/` became the only deployed
source. Equivalent files now live under `react-app/public/` and are copied into
`dist/` on every build.

`node_modules/` and `react-app/dist/` are generated and git-ignored (not shown).

```
devmn/
├── .github/
│   └── workflows/
│       └── deploy.yml                GitHub Pages build + deploy (on push to main)
├── .gitignore                        OS/editor junk + defensive node_modules/dist
├── react-app/                        Vite + React app (the live site)
│   ├── public/                       copied verbatim into dist/ on build
│   │   ├── images/
│   │   │   └── profile.png           stable crawlable profile URL (JSON-LD / OG)
│   │   ├── .nojekyll                 disables Jekyll processing on GitHub Pages
│   │   ├── 404.html                  SPA fallback (noindex, canonical to root)
│   │   ├── apple-touch-icon.png      iOS home-screen icon
│   │   ├── CNAME                     custom domain (devfazla.com) -> dist/
│   │   ├── favicon.png               site favicon
│   │   ├── icon-192.png              PWA icon
│   │   ├── icon-512.png              PWA icon
│   │   ├── og-image.png              Open Graph / social share image
│   │   ├── robots.txt                crawl rules + sitemap reference
│   │   ├── routes.yml                runtime route config (fetched by hooks.js)
│   │   ├── site.webmanifest          PWA manifest
│   │   └── sitemap.xml               canonical URL list (single production URL)
│   ├── src/
│   │   ├── assets/
│   │   │   ├── profile.jpg           hero portrait (imported by Hero.jsx)
│   │   │   ├── proj-health.jpg       generated project cover
│   │   │   ├── proj-sports.jpg       generated project cover
│   │   │   └── proj-super.jpg        generated project cover
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── Skills.jsx
│   │   ├── App.jsx                   route/layout composition
│   │   ├── data.js                   content (profile, skills, projects, themes)
│   │   ├── hooks.js                  theme, fade-in, route-not-found handling
│   │   ├── index.css                 design system (tokens, layout, motion)
│   │   ├── main.jsx                  React entry point
│   │   ├── seo.js                    per-route document head / JSON-LD management
│   │   └── themes.css                6-theme switcher overrides
│   ├── .gitignore                    node_modules, dist, editor junk
│   ├── .oxlintrc.json                lint config
│   ├── index.html                    HTML shell + static SEO head
│   ├── package.json                  scripts + deps
│   ├── package-lock.json             locked dep tree (used by CI npm ci)
│   ├── README.md
│   └── vite.config.js                Vite config (base "/", React plugin)
├── scripts/
│   ├── check-seo.mjs                 SEO/crawl-file audit against the build
│   ├── make-brand-assets.ps1         GDI+ icon/brand asset generator
│   └── make-project-covers.ps1       GDI+ project cover generator
└── structure.md                      this file
```

## Cleanup summary (this change)

**Deleted (legacy static site, no longer referenced):**
- `index.html` (root) — old single-file site
- `CNAME` (root) — duplicated by `react-app/public/CNAME`
- `routes.yml` (root) — duplicated by `react-app/public/routes.yml`
- `images/Fazla_Rabbi_1.png`, `images/profile.png` (root) — unused legacy assets
- `react-app/public/Fazla_Rabbi_1.png` — referenced nowhere
- `react-app/src/assets/profile.png` — unused (`profile.jpg` is imported instead)

**Added:**
- `.gitignore` (root) — junk + defensive ignores

**Verified after cleanup:** `npm run build` succeeds; `scripts/check-seo.mjs` 39/39
pass; `dist/` still exposes `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.png`,
`/images/profile.png`, plus `CNAME`, `routes.yml`, `404.html`, `.nojekyll`.
