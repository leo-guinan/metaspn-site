# MetaSPN Season 1 Landing Page

A minimal, mythic landing page for MetaSPN Season 1: The Search for Heroes.

## Design Philosophy

**Minimal. Mythic. Serious. Human.**

This site should feel like:
- A chess tournament
- An Olympic trials broadcast
- A classified research lab
- An ancient guild hall

Not a SaaS landing page.

## Deployment

This site is designed to be deployed via GitHub Pages.

### Setup Instructions

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select your source branch (usually `main` or `master`)
4. Select the root directory
5. Save

The site will be available at `https://[username].github.io/[repository-name]`

### Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# Then visit http://localhost:8000
```

## File Structure

```
.
├── index.html      # Main HTML file
├── styles.css      # All styles
└── README.md       # This file
```

## Color System

- **70-75%**: Obsidian Black / Charcoal (background)
- **15-20%**: Bone / Warm Off-White (text)
- **3-5%**: Gold (accents, emphasis)
- **1-3%**: Deep Red (warnings, thresholds)

## Typography

- **Headlines**: Cormorant Garamond (humanist serif)
- **Body**: Inter (clean sans-serif)

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). No polyfills or fallbacks needed for the minimal feature set.
