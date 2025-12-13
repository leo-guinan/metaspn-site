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
├── charter.html    # Internet 2.0 Charter page
├── styles.css      # All styles
└── README.md       # This file
```

## Analytics & Email Capture

### Fathom Analytics

Fathom Analytics is already configured with site ID `YDMELMTV`. The following events are tracked:

- **Link Clicks**: All CTA buttons and navigation links
- **Email Submissions**: Form submissions (success and error)

### Email Form Setup (Formspree)

The email capture form uses Formspree, which requires no API key and works with static sites.

**Setup Steps:**

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form (free tier allows 50 submissions/month)
3. Copy your form endpoint URL (looks like `https://formspree.io/f/YOUR_FORM_ID`)
4. In `index.html`, find the email form and replace `YOUR_FORM_ID` with your actual Formspree form ID:

```html
<form id="email-form" class="email-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

That's it! The form will now send emails to your Formspree account, and you'll receive notifications for each submission.

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
