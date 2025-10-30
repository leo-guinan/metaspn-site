# MetaSPN Blog Template

A lightweight, SEO-optimized blog template for MetaSPN. No CMS required - just copy, customize, and deploy.

## Files Structure

```
metaspn/
├── blog/
│   ├── index.html              # Blog index page
│   └── blog-styles.css         # Blog-specific styles
├── blog-post-template.html     # Template for new posts
├── blog-styles.css            # Blog styles (shared)
└── blog-script.js             # Blog functionality
```

## How to Create a New Blog Post

### 1. Copy the Template
```bash
cp blog-post-template.html blog/your-post-slug.html
```

### 2. Replace Placeholders
Search and replace these placeholders in your new post:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `POST_TITLE` | Your post title | "The Future of Founder Competition" |
| `POST_DESCRIPTION` | Meta description | "Exploring how conscious competition will reshape startup culture..." |
| `POST_KEYWORDS` | Comma-separated keywords | "founders, competition, startup, innovation" |
| `POST_SLUG` | URL-friendly slug | "future-founder-competition" |
| `POST_IMAGE` | Featured image filename | "future-competition.png" |
| `POST_PUBLISH_DATE` | ISO date | "2024-10-27T10:00:00Z" |
| `POST_MODIFIED_DATE` | ISO date | "2024-10-27T10:00:00Z" |
| `POST_TAGS` | Comma-separated tags | "MetaSPN, Competition, Future" |
| `POST_READ_TIME` | Estimated read time | "8" |

### 3. Add Your Content
Replace the placeholder content in the `.post-body` section with your actual blog post content.

### 4. Update Blog Index
Add your new post to `blog/index.html` in the `.posts-grid` section.

## SEO Features Included

### Meta Tags
- Title, description, keywords
- Open Graph (Facebook)
- Twitter Cards
- Canonical URL
- Article-specific meta tags

### Structured Data
- JSON-LD schema for BlogPosting
- Author and publisher information
- Publication dates

### Technical SEO
- Semantic HTML structure
- Proper heading hierarchy (H1 → H2 → H3)
- Alt text for images
- Internal linking structure

## Blog Features

### Automatic Features
- Table of Contents generation
- Reading progress indicator
- Copy code buttons
- Social sharing buttons
- Reading time calculation
- Smooth scroll navigation

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly navigation
- Optimized typography

## Content Guidelines

### Headings
- Use H2 for main sections
- Use H3 for subsections
- Use H4 for sub-subsections
- Maintain logical hierarchy

### Images
- Use descriptive alt text
- Optimize file sizes
- Use consistent aspect ratios
- Include captions when helpful

### Links
- Use descriptive link text
- Open external links in new tabs
- Use internal links to related content

## Customization

### Colors
Update CSS variables in `blog-styles.css`:
```css
:root {
    --black: #0D0D0D;
    --neon-blue: #00D4FF;
    --white: #FFFFFF;
    --accent-magenta: #FF3366;
}
```

### Typography
Fonts are loaded from Google Fonts:
- Montserrat (headings)
- Inter (body text)

### Layout
- Two-column layout (content + sidebar)
- Single-column on mobile
- Sticky table of contents

## Deployment

### GitHub Pages
1. Push to your repository
2. Enable GitHub Pages in settings
3. Set source to main branch
4. Your blog will be live at `username.github.io/repository-name/blog/`

### Custom Domain
1. Add CNAME file with your domain
2. Update all URLs in templates
3. Configure DNS settings

## Performance Tips

### Images
- Use WebP format when possible
- Compress images before uploading
- Use appropriate sizes for different screens

### Code
- Minify CSS and JavaScript for production
- Use a CDN for static assets
- Enable gzip compression

## Analytics

### Google Analytics
Add your tracking code to the `<head>` section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### ConvertKit
The template includes ConvertKit integration for email capture.

## Maintenance

### Regular Updates
- Update publication dates
- Check for broken links
- Optimize images
- Update related posts

### Content Strategy
- Publish consistently
- Use internal linking
- Update old posts
- Monitor analytics

## Support

For questions or issues with the blog template, check:
1. This README
2. The template files
3. Your HTML/CSS knowledge
4. MetaSPN community

---

**Remember:** This is a static blog template. No database, no CMS, no complexity. Just copy, customize, and deploy.
