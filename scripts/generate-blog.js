import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env from project root
dotenv.config({ path: join(rootDir, '.env') })

// Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

// Convert Sanity block content to HTML
function blocksToHTML(blocks) {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks.map(block => {
    if (block._type === 'block') {
      let html = block.children.map(child => {
        let text = child.text || ''
        
        // Apply marks (bold, italic, code, links)
        if (child.marks) {
          child.marks.forEach(mark => {
            if (mark === 'strong') {
              text = `<strong>${text}</strong>`
            } else if (mark === 'em') {
              text = `<em>${text}</em>`
            } else if (mark === 'code') {
              text = `<code>${text}</code>`
            } else if (typeof mark === 'object' && mark._type === 'link') {
              const target = mark.openInNewTab ? ' target="_blank" rel="noreferrer"' : ''
              text = `<a href="${mark.href}"${target}>${text}</a>`
            }
          })
        }
        
        return text
      }).join('')
      
      // Apply block styles
      const style = block.style || 'normal'
      if (style === 'h2') return `<h2>${html}</h2>`
      if (style === 'h3') return `<h3>${html}</h3>`
      if (style === 'h4') return `<h4>${html}</h4>`
      if (style === 'blockquote') return `<blockquote>${html}</blockquote>`
      return `<p>${html}</p>`
    }
    
    if (block._type === 'image') {
      const url = block.asset?._ref 
        ? `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`
        : block.asset?.url || ''
      const alt = block.alt || ''
      const caption = block.caption ? `<figcaption>${block.caption}</figcaption>` : ''
      return `<figure><img src="${url}" alt="${alt}" />${caption}</figure>`
    }
    
    return ''
  }).join('\n')
}

// Get image URL from Sanity asset reference
function getImageURL(asset) {
  if (!asset) return ''
  if (asset.url) return asset.url
  if (asset._ref) {
    return `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/${asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`
  }
  return ''
}

// Format date for display
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Generate HTML for a single blog post
function generatePostHTML(post, template) {
  const slug = post.slug.current
  const publishedDate = new Date(post.publishedAt)
  const modifiedDate = post.modifiedAt ? new Date(post.modifiedAt) : publishedDate
  
  const featuredImageURL = getImageURL(post.featuredImage?.asset)
  const ogImageURL = post.ogImage?.asset ? getImageURL(post.ogImage.asset) : featuredImageURL
  
  // Extract filename from URL or use default
  const imageFilename = featuredImageURL 
    ? (featuredImageURL.includes('/') ? featuredImageURL.split('/').pop() : featuredImageURL)
    : 'blog-og.jpg'
  
  const tags = post.tags?.join(', ') || ''
  const keywords = post.keywords || tags
  
  let html = template
    .replace(/POST_TITLE/g, escapeHTML(post.title))
    .replace(/POST_DESCRIPTION/g, escapeHTML(post.description))
    .replace(/POST_KEYWORDS/g, escapeHTML(keywords))
    .replace(/POST_SLUG/g, slug)
    .replace(/POST_IMAGE/g, imageFilename)
    .replace(/POST_PUBLISH_DATE/g, publishedDate.toISOString())
    .replace(/data-date="POST_PUBLISH_DATE"/g, `data-date="${publishedDate.toISOString()}"`)
    .replace(/POST_MODIFIED_DATE/g, modifiedDate.toISOString())
    .replace(/POST_TAGS/g, escapeHTML(tags))
    .replace(/POST_READ_TIME/g, post.readTime || '5')
    .replace(/POST_AUTHOR/g, escapeHTML(post.author || 'Leo Guinan'))
    .replace(/POST_EXCERPT/g, escapeHTML(post.excerpt || post.description))
    .replace(/POST_CONTENT/g, blocksToHTML(post.content))
    .replace(/OG_IMAGE_URL/g, ogImageURL)
    .replace(/FEATURED_IMAGE_URL/g, featuredImageURL)
    .replace(/FEATURED_IMAGE_ALT/g, escapeHTML(post.featuredImage?.alt || post.title))
  
  // Format display dates
  html = html.replace(/<span class="post-date" data-date="[^"]*"><\/span>/g, 
    `<span class="post-date">${formatDate(post.publishedAt)}</span>`)
  
  return html
}

// Generate blog index HTML
function generateIndexHTML(posts, indexTemplate) {
  const postsHTML = posts.map(post => {
    const slug = post.slug.current
    const publishedDate = new Date(post.publishedAt)
    const featuredImageURL = getImageURL(post.featuredImage?.asset)
    
    // Extract filename from URL or use default
    const imageFilename = featuredImageURL 
      ? (featuredImageURL.includes('/') ? featuredImageURL.split('/').pop() : featuredImageURL)
      : 'blog-og.jpg'
    
    // Use local image path (assuming images are in ../images/)
    const localImagePath = `../images/${imageFilename}`
    
    return `
                <article class="post-card">
                    <div class="post-image">
                        <img src="${localImagePath}" alt="${escapeHTML(post.title)}">
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="post-date">${formatDate(post.publishedAt)}</span>
                            <span class="post-tags">${escapeHTML(post.tags?.join(', ') || '')}</span>
                        </div>
                        <h2><a href="${slug}.html">${escapeHTML(post.title)}</a></h2>
                        <p>${escapeHTML(post.excerpt || post.description)}</p>
                        <div class="post-footer">
                            <div class="author-info">
                                <img src="../images/leo-guinan.jpg" alt="${escapeHTML(post.author || 'Leo Guinan')}" class="author-avatar">
                                <span class="author-name">${escapeHTML(post.author || 'Leo Guinan')}</span>
                            </div>
                            <span class="read-time">${post.readTime || 5} min read</span>
                        </div>
                    </div>
                </article>`
  }).join('\n\n                ')
  
  // Replace everything from POSTS_PLACEHOLDER to the closing </div> of posts-grid
  // This removes all existing hardcoded posts
  const placeholderRegex = /<!-- POSTS_PLACEHOLDER -->[\s\S]*?<\/div>\s*<\/div>\s*<\/main>/
  const replacement = `<!-- POSTS_PLACEHOLDER -->${postsHTML}

            </div>
        </div>
    </main>`
  
  return indexTemplate.replace(placeholderRegex, replacement)
}

function escapeHTML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Generate landing page with embedded featured posts data
function generateLandingPageWithFeaturedPosts(featuredPosts, template) {
  // Create JSON data for featured posts
  const postsData = featuredPosts.map(post => {
    const slug = post.slug.current
    const featuredImageURL = getImageURL(post.featuredImage?.asset)
    
    // Clean up title - remove any "- MetaSPN Blog" suffix that might be added
    let title = post.title || 'Untitled'
    title = title.replace(/\s*-\s*MetaSPN\s*Blog\s*$/i, '').trim()
    
    return {
      title: title,
      slug: slug,
      excerpt: post.excerpt || post.description,
      description: post.description,
      publishedAt: post.publishedAt,
      tags: post.tags || [],
      readTime: post.readTime || 5,
      featuredImage: {
        url: featuredImageURL,
        alt: post.featuredImage?.alt || title
      }
    }
  })
  
  // Embed the data as JSON in a script tag
  const scriptTag = `<script type="application/json" id="featured-posts-data">${JSON.stringify(postsData)}</script>`
  
  // Remove any existing featured-posts-data script tags first
  let cleanedTemplate = template.replace(/<script[^>]*id="featured-posts-data"[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Insert before the closing body tag or before the script.js include
  // Look for the script.js include and insert before it
  if (cleanedTemplate.includes('<script src="script.js"></script>')) {
    return cleanedTemplate.replace(
      '<script src="script.js"></script>',
      `${scriptTag}\n    <script src="script.js"></script>`
    )
  }
  
  // Fallback: insert before closing body tag
  return cleanedTemplate.replace('</body>', `    ${scriptTag}\n</body>`)
}

async function main() {
  console.log('🚀 Fetching blog posts from Sanity...')
  
  try {
    // Fetch all published posts, ordered by published date (newest first)
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
        _id,
        title,
        slug,
        description,
        keywords,
        author,
        publishedAt,
        modifiedAt,
        featuredImage {
          asset,
          alt
        },
        ogImage {
          asset
        },
        tags,
        readTime,
        content,
        excerpt
      }
    `)
    
    console.log(`✅ Found ${posts.length} blog posts`)
    
    if (posts.length === 0) {
      console.log('⚠️  No posts found. Make sure you have published posts in Sanity.')
      return
    }
    
    // Read templates
    const postTemplate = readFileSync(join(rootDir, 'blog-post-template.html'), 'utf-8')
    const indexTemplate = readFileSync(join(rootDir, 'blog/index.html'), 'utf-8')
    const landingPageTemplate = readFileSync(join(rootDir, 'index.html'), 'utf-8')
    
    // Ensure blog directory exists
    const blogDir = join(rootDir, 'blog')
    mkdirSync(blogDir, { recursive: true })
    
    // Generate individual post HTML files
    console.log('📝 Generating blog post HTML files...')
    for (const post of posts) {
      const slug = post.slug.current
      const html = generatePostHTML(post, postTemplate)
      const filePath = join(blogDir, `${slug}.html`)
      writeFileSync(filePath, html, 'utf-8')
      console.log(`   ✓ Generated ${slug}.html`)
    }
    
    // Generate blog index
    console.log('📋 Generating blog index...')
    const indexHTML = generateIndexHTML(posts, indexTemplate)
    writeFileSync(join(blogDir, 'index.html'), indexHTML, 'utf-8')
    console.log('   ✓ Generated index.html')
    
    // Update landing page with featured posts data
    console.log('🏠 Updating landing page with featured posts...')
    const landingPageHTML = generateLandingPageWithFeaturedPosts(posts.slice(0, 3), landingPageTemplate)
    writeFileSync(join(rootDir, 'index.html'), landingPageHTML, 'utf-8')
    console.log('   ✓ Updated index.html with featured posts')
    
    console.log('✨ Blog generation complete!')
    
  } catch (error) {
    console.error('❌ Error generating blog:', error)
    process.exit(1)
  }
}

main()

