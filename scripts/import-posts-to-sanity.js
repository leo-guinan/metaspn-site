import {createClient} from '@sanity/client'
import {readFileSync, readdirSync, existsSync} from 'fs'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'
import {JSDOM} from 'jsdom'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env from project root
dotenv.config({ path: join(rootDir, '.env') })

const blogDir = join(rootDir, 'blog')

// Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN, // Required for writes
})

// Parse HTML to extract metadata and content
function parseBlogPost(htmlContent, filename) {
  const dom = new JSDOM(htmlContent)
  const document = dom.window.document
  
  // Extract metadata from meta tags
  const title = document.querySelector('meta[property="og:title"]')?.content || 
                document.querySelector('title')?.textContent?.replace(' - MetaSPN Blog', '') || 
                document.querySelector('h1.post-title')?.textContent || 
                'Untitled'
  
  const description = document.querySelector('meta[name="description"]')?.content || 
                     document.querySelector('meta[property="og:description"]')?.content || 
                     ''
  
  const keywords = document.querySelector('meta[name="keywords"]')?.content || ''
  
  const publishedAt = document.querySelector('meta[property="article:published_time"]')?.content || 
                      document.querySelector('meta[property="article:published_time"]')?.content ||
                      new Date().toISOString()
  
  const modifiedAt = document.querySelector('meta[property="article:modified_time"]')?.content || publishedAt
  
  const author = document.querySelector('meta[name="author"]')?.content || 
                 document.querySelector('meta[property="article:author"]')?.content || 
                 'Leo Guinan'
  
  const tags = document.querySelector('meta[property="article:tag"]')?.content?.split(',').map(t => t.trim()) || 
               keywords.split(',').map(t => t.trim()).filter(t => t) || 
               []
  
  // Extract read time
  const readTimeMatch = document.querySelector('.read-time')?.textContent?.match(/(\d+)\s*min\s*read/i)
  const readTime = readTimeMatch ? parseInt(readTimeMatch[1]) : 5
  
  // Extract slug from filename
  const slug = filename.replace('.html', '')
  
  // Extract excerpt
  const excerpt = document.querySelector('.post-excerpt p')?.textContent || description
  
  // Extract featured image
  const featuredImageSrc = document.querySelector('.featured-image img')?.src || 
                           document.querySelector('meta[property="og:image"]')?.content || 
                           ''
  
  // Extract image filename (remove ../images/ prefix if present)
  const featuredImageFilename = featuredImageSrc.includes('/') 
    ? featuredImageSrc.split('/').pop() 
    : featuredImageSrc.replace('../images/', '').replace('images/', '')
  
  // Extract content from .post-body
  const postBody = document.querySelector('.post-body')
  const content = postBody ? convertHTMLToSanityBlocks(postBody) : []
  
  return {
    title: title.trim(),
    slug,
    description: description.trim(),
    keywords: keywords.trim(),
    author: author.trim(),
    publishedAt,
    modifiedAt,
    tags: tags.filter(t => t),
    readTime,
    excerpt: excerpt.trim(),
    featuredImageFilename,
    content,
  }
}

// Convert HTML to Sanity block format
function convertHTMLToSanityBlocks(element) {
  const blocks = []
  
  if (!element) return blocks
  
  // Process all child nodes
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent.trim()
      if (text) {
        // Add text to last block or create new block
        if (blocks.length > 0 && blocks[blocks.length - 1]._type === 'block' && blocks[blocks.length - 1].style === 'normal') {
          blocks[blocks.length - 1].children.push({
            _type: 'span',
            text: text,
            marks: [],
          })
        } else {
          blocks.push({
            _type: 'block',
            style: 'normal',
            children: [{
              _type: 'span',
              text: text,
              marks: [],
            }],
            markDefs: [],
          })
        }
      }
    } else if (node.nodeType === 1) { // Element node
      const tagName = node.tagName?.toLowerCase()
      
      if (tagName === 'p') {
        const text = node.textContent.trim()
        if (text) {
          blocks.push({
            _type: 'block',
            style: 'normal',
            children: convertTextNode(node),
            markDefs: [],
          })
        }
      } else if (tagName === 'h2') {
        const text = node.textContent.trim()
        if (text) {
          blocks.push({
            _type: 'block',
            style: 'h2',
            children: convertTextNode(node),
            markDefs: [],
          })
        }
      } else if (tagName === 'h3') {
        const text = node.textContent.trim()
        if (text) {
          blocks.push({
            _type: 'block',
            style: 'h3',
            children: convertTextNode(node),
            markDefs: [],
          })
        }
      } else if (tagName === 'h4') {
        const text = node.textContent.trim()
        if (text) {
          blocks.push({
            _type: 'block',
            style: 'h4',
            children: convertTextNode(node),
            markDefs: [],
          })
        }
      } else if (tagName === 'blockquote') {
        const text = node.textContent.trim()
        if (text) {
          blocks.push({
            _type: 'block',
            style: 'blockquote',
            children: convertTextNode(node),
            markDefs: [],
          })
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        // Convert lists to paragraphs for now (Sanity blocks don't have native lists)
        const items = node.querySelectorAll('li')
        items.forEach(item => {
          const text = item.textContent.trim()
          if (text) {
            blocks.push({
              _type: 'block',
              style: 'normal',
              children: [{
                _type: 'span',
                text: `• ${text}`,
                marks: [],
              }],
              markDefs: [],
            })
          }
        })
      } else if (tagName === 'img') {
        // Images will need to be uploaded separately or referenced
        // For now, we'll skip them or add a note
        const alt = node.getAttribute('alt') || ''
        const src = node.getAttribute('src') || ''
        // Note: You'll need to upload images to Sanity separately
        console.log(`  ⚠️  Image found: ${src} - will need manual upload`)
      } else if (tagName === 'strong' || tagName === 'b') {
        // Handle inline strong tags
        const text = node.textContent.trim()
        if (text) {
          if (blocks.length > 0 && blocks[blocks.length - 1]._type === 'block') {
            blocks[blocks.length - 1].children.push({
              _type: 'span',
              text: text,
              marks: ['strong'],
            })
          } else {
            blocks.push({
              _type: 'block',
              style: 'normal',
              children: [{
                _type: 'span',
                text: text,
                marks: ['strong'],
              }],
              markDefs: [],
            })
          }
        }
      } else if (tagName === 'em' || tagName === 'i') {
        // Handle inline em tags
        const text = node.textContent.trim()
        if (text) {
          if (blocks.length > 0 && blocks[blocks.length - 1]._type === 'block') {
            blocks[blocks.length - 1].children.push({
              _type: 'span',
              text: text,
              marks: ['em'],
            })
          } else {
            blocks.push({
              _type: 'block',
              style: 'normal',
              children: [{
                _type: 'span',
                text: text,
                marks: ['em'],
              }],
              markDefs: [],
            })
          }
        }
      } else if (tagName === 'a') {
        // Handle links
        const text = node.textContent.trim()
        const href = node.getAttribute('href') || ''
        if (text) {
          if (blocks.length > 0 && blocks[blocks.length - 1]._type === 'block') {
            blocks[blocks.length - 1].children.push({
              _type: 'span',
              text: text,
              marks: [],
            })
            // Add link annotation
            if (blocks[blocks.length - 1].markDefs) {
              const markKey = `link-${blocks[blocks.length - 1].markDefs.length}`
              blocks[blocks.length - 1].markDefs.push({
                _type: 'link',
                _key: markKey,
                href: href,
                openInNewTab: href.startsWith('http'),
              })
              // Update the span to reference the mark
              const lastChild = blocks[blocks.length - 1].children[blocks[blocks.length - 1].children.length - 1]
              if (lastChild) {
                lastChild.marks = lastChild.marks || []
                lastChild.marks.push(markKey)
              }
            }
          }
        }
      } else {
        // Recursively process other elements
        const nestedBlocks = convertHTMLToSanityBlocks(node)
        blocks.push(...nestedBlocks)
      }
    }
  }
  
  return blocks
}

// Convert text node with inline formatting
function convertTextNode(element) {
  const children = []
  
  function processNode(node) {
    if (node.nodeType === 3) { // Text
      const text = node.textContent.trim()
      if (text) {
        children.push({
          _type: 'span',
          text: text + (node.nextSibling ? ' ' : ''),
          marks: [],
        })
      }
    } else if (node.nodeType === 1) { // Element
      const tagName = node.tagName?.toLowerCase()
      const text = node.textContent.trim()
      
      if (tagName === 'strong' || tagName === 'b') {
        children.push({
          _type: 'span',
          text: text,
          marks: ['strong'],
        })
      } else if (tagName === 'em' || tagName === 'i') {
        children.push({
          _type: 'span',
          text: text,
          marks: ['em'],
        })
      } else if (tagName === 'code') {
        children.push({
          _type: 'span',
          text: text,
          marks: ['code'],
        })
      } else if (tagName === 'a') {
        const href = node.getAttribute('href') || ''
        children.push({
          _type: 'span',
          text: text,
          marks: [],
        })
        // Note: Links would need markDefs - simplified for now
      } else {
        // Process children
        for (const child of Array.from(node.childNodes)) {
          processNode(child)
        }
      }
    }
  }
  
  for (const child of Array.from(element.childNodes)) {
    processNode(child)
  }
  
  return children.length > 0 ? children : [{
    _type: 'span',
    text: element.textContent || '',
    marks: [],
  }]
}

// Upload image to Sanity (if file exists locally)
async function uploadImageIfExists(imageFilename) {
  if (!imageFilename) return null
  
  const imagePath = join(rootDir, 'images', imageFilename)
  
  if (!existsSync(imagePath)) {
    console.log(`  ⚠️  Image not found: ${imagePath}`)
    return null
  }
  
  try {
    const imageBuffer = readFileSync(imagePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: imageFilename,
    })
    console.log(`  ✅ Uploaded image: ${imageFilename}`)
    return asset._id
  } catch (error) {
    console.error(`  ❌ Error uploading image ${imageFilename}:`, error.message)
    return null
  }
}

// Create post in Sanity
async function createPostInSanity(postData) {
  try {
    // Upload featured image if it exists
    let featuredImage = null
    if (postData.featuredImageFilename) {
      const imageId = await uploadImageIfExists(postData.featuredImageFilename)
      if (imageId) {
        featuredImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageId,
          },
          alt: postData.title,
        }
      }
    }
    
    // Create the post
    const post = {
      _type: 'post',
      title: postData.title,
      slug: {
        _type: 'slug',
        current: postData.slug,
      },
      description: postData.description,
      keywords: postData.keywords,
      author: postData.author,
      publishedAt: postData.publishedAt,
      modifiedAt: postData.modifiedAt,
      tags: postData.tags,
      readTime: postData.readTime,
      excerpt: postData.excerpt,
      content: postData.content,
    }
    
    if (featuredImage) {
      post.featuredImage = featuredImage
    }
    
    const created = await client.create(post)
    console.log(`  ✅ Created: ${postData.title}`)
    return created
  } catch (error) {
    console.error(`  ❌ Error creating post "${postData.title}":`, error.message)
    if (error.message.includes('duplicate')) {
      console.log(`  ℹ️  Post with slug "${postData.slug}" may already exist`)
    }
    throw error
  }
}

// Main function
async function main() {
  console.log('🚀 Starting blog post migration to Sanity...\n')
  
  // Check if .env file exists
  const envPath = join(rootDir, '.env')
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found!')
    console.error(`   Expected location: ${envPath}`)
    console.error('   Create a .env file with:')
    console.error('   SANITY_PROJECT_ID=your-project-id')
    console.error('   SANITY_DATASET=production')
    console.error('   SANITY_TOKEN=your-token')
    process.exit(1)
  }
  
  if (!process.env.SANITY_PROJECT_ID) {
    console.error('❌ SANITY_PROJECT_ID not set in .env file')
    console.error(`   Check your .env file at: ${envPath}`)
    process.exit(1)
  }
  
  if (!process.env.SANITY_TOKEN) {
    console.error('❌ SANITY_TOKEN not set in .env file')
    console.error('   Get your token from: https://www.sanity.io/manage → Your Project → API → Tokens')
    console.error('   Create a token with Editor permissions (Contributor may not have write access)')
    process.exit(1)
  }
  
  console.log(`✅ Using project: ${process.env.SANITY_PROJECT_ID}`)
  console.log(`✅ Using dataset: ${process.env.SANITY_DATASET || 'production'}`)
  console.log(`✅ Token configured (checking permissions...)\n`)
  
  // Test token permissions
  try {
    await client.fetch('*[_type == "post"][0...1]')
    console.log('✅ Token has read access')
  } catch (error) {
    console.error('❌ Token read test failed:', error.message)
    console.error('   Your token may not have the correct permissions')
    process.exit(1)
  }
  
  // Get all HTML files in blog directory (excluding index.html)
  const files = readdirSync(blogDir)
    .filter(file => file.endsWith('.html') && file !== 'index.html')
  
  console.log(`📚 Found ${files.length} blog posts to migrate\n`)
  
  const results = {
    success: [],
    failed: [],
    skipped: [],
  }
  
  for (const file of files) {
    console.log(`📄 Processing: ${file}`)
    
    try {
      const filePath = join(blogDir, file)
      const htmlContent = readFileSync(filePath, 'utf-8')
      
      const postData = parseBlogPost(htmlContent, file)
      console.log(`   Title: ${postData.title}`)
      console.log(`   Slug: ${postData.slug}`)
      
      // Check if post already exists
      const existing = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        {slug: postData.slug}
      )
      
      if (existing) {
        console.log(`   ⏭️  Post already exists, skipping...`)
        results.skipped.push(file)
        continue
      }
      
      await createPostInSanity(postData)
      results.success.push(file)
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
      
      // Provide helpful error message for permission issues
      if (error.message.includes('permission') || error.message.includes('Insufficient')) {
        console.error(`   💡 Tip: Your token needs "Editor" permissions, not "Contributor"`)
        console.error(`      Go to: https://www.sanity.io/manage → Your Project → API → Tokens`)
        console.error(`      Edit your token and change permissions to "Editor"`)
      }
      
      results.failed.push({file, error: error.message})
    }
    
    console.log('') // Empty line between posts
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary')
  console.log('='.repeat(50))
  console.log(`✅ Successfully imported: ${results.success.length}`)
  console.log(`⏭️  Skipped (already exist): ${results.skipped.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  
  if (results.success.length > 0) {
    console.log('\n✅ Successfully imported:')
    results.success.forEach(file => console.log(`   - ${file}`))
  }
  
  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped:')
    results.skipped.forEach(file => console.log(`   - ${file}`))
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed:')
    results.failed.forEach(({file, error}) => console.log(`   - ${file}: ${error}`))
  }
  
  console.log('\n✨ Migration complete!')
  console.log('\nNext steps:')
  console.log('1. Review posts in Sanity Studio')
  console.log('2. Run `npm run build:blog` to generate HTML from Sanity')
  console.log('3. Check that images uploaded correctly')
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

