<div align="center">
  <img src="site/assets/img/logo/brand_logo_dark_theme.png" width="128" height="128">

  # Endurain site

  [![License](https://img.shields.io/badge/license-AGPL%20v3-blue)](./LICENSE)
  [![Trademark Policy](https://img.shields.io/badge/trademark-Endurain%E2%84%A2-blue)](./TRADEMARK.md)

  **Source of the [endurain.com](https://endurain.com) marketing website**
</div>

> [!NOTE]
> This repository is a mirror. Issues, pull requests, and all project activity are tracked on Codeberg: [https://codeberg.org/endurain-project/site](https://codeberg.org/endurain-project/site)

## What is this?

This repo contains the static marketing/landing page for [Endurain](https://codeberg.org/endurain-project/endurain), a self-hosted, privacy-first fitness tracking service. It's plain, dependency-free HTML/CSS/JS, no framework or build step, deployed as-is to [Codeberg Pages](https://codeberg.page/).

## Structure

```
site/                   # Deployed site root
├── index.html          # Single-page landing page (English is the canonical copy)
├── assets/
│   ├── css/style.css   # Styles
│   ├── js/             # Progressive enhancement: theme toggle, nav, i18n
│   ├── i18n/*.json      # Translated strings, one file per locale
│   └── img/            # Logos, screenshots, mobile/brand assets
└── downloads/          # Static downloads (e.g. Android APK)
```

## Local development

The site needs no build step, opening `site/index.html` directly in a browser (or serving the `site/` folder with any static file server) is enough to preview changes.

Formatting and linting use Node.js tooling from within `site/`:

```bash
cd site
npm install
npm run format:check   # Prettier
npm run lint:check      # ESLint
npm run check            # both
```

Run `npm run format` / `npm run lint` to auto-fix issues.

## Translations

English strings live directly in `site/index.html`. Other locales live under `site/assets/i18n/` and are contributed via [Codeberg Translate](https://translate.codeberg.org/projects/endurain/) rather than direct PRs, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Endurain and this website are licensed under [AGPL-3.0](./LICENSE). "Endurain" is a trademark, see [TRADEMARK.md](./TRADEMARK.md).
