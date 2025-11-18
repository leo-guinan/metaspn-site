/**
 * Example script showing how to update blog posts programmatically
 * 
 * Usage:
 *   node scripts/example-update-post.js
 * 
 * Make sure to set SANITY_PROJECT_ID and SANITY_TOKEN in your .env file
 */

import {createClient} from '@sanity/client'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env from project root
dotenv.config({ path: join(rootDir, '.env') })

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN, // Get from Sanity project settings → API → Tokens
})

async function exampleCreatePost() {
  console.log('📝 Creating a new blog post...')
  
  try {
    const newPost = await client.create({
      _type: 'post',
      title: 'Example: How to Update Posts Programmatically',
      slug: {
        current: 'example-programmatic-updates',
      },
      description: 'Learn how to update your MetaSPN blog posts using the Sanity API.',
      keywords: 'Sanity, CMS, API, MetaSPN',
      author: 'Leo Guinan',
      publishedAt: new Date().toISOString(),
      tags: ['Sanity', 'CMS', 'Tutorial'],
      readTime: 5,
      excerpt: 'This is an example post created programmatically using the Sanity API.',
      content: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'This post was created programmatically! You can use the Sanity API to create, update, and delete posts.',
            },
          ],
        },
        {
          _type: 'block',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: 'Getting Started',
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'To update posts programmatically, you need a write token from Sanity. Get it from your project settings.',
            },
          ],
        },
      ],
    })
    
    console.log('✅ Post created:', newPost._id)
    return newPost._id
  } catch (error) {
    console.error('❌ Error creating post:', error.message)
    throw error
  }
}

async function exampleUpdatePost(postId) {
  console.log('✏️  Updating post...')
  
  try {
    const updated = await client
      .patch(postId)
      .set({
        title: 'Updated: How to Update Posts Programmatically',
        modifiedAt: new Date().toISOString(),
      })
      .commit()
    
    console.log('✅ Post updated:', updated._id)
  } catch (error) {
    console.error('❌ Error updating post:', error.message)
    throw error
  }
}

async function exampleFetchPosts() {
  console.log('📚 Fetching all posts...')
  
  try {
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt
      }
    `)
    
    console.log(`✅ Found ${posts.length} posts:`)
    posts.forEach(post => {
      console.log(`   - ${post.title} (${post.slug.current})`)
    })
    
    return posts
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message)
    throw error
  }
}

async function exampleDeletePost(postId) {
  console.log('🗑️  Deleting post...')
  
  try {
    await client.delete(postId)
    console.log('✅ Post deleted')
  } catch (error) {
    console.error('❌ Error deleting post:', error.message)
    throw error
  }
}

// Main execution
async function main() {
  if (!process.env.SANITY_PROJECT_ID) {
    console.error('❌ SANITY_PROJECT_ID not set in .env file')
    process.exit(1)
  }
  
  if (!process.env.SANITY_TOKEN) {
    console.error('❌ SANITY_TOKEN not set in .env file')
    console.log('   Get your token from: https://www.sanity.io/manage → Your Project → API → Tokens')
    process.exit(1)
  }
  
  try {
    // Fetch existing posts
    await exampleFetchPosts()
    
    // Uncomment to create a new post
    // const postId = await exampleCreatePost()
    
    // Uncomment to update a post (replace with actual post ID)
    // await exampleUpdatePost('post-id-here')
    
    // Uncomment to delete a post (replace with actual post ID)
    // await exampleDeletePost('post-id-here')
    
    console.log('\n✨ Done!')
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

