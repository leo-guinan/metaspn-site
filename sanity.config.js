import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Vite exposes env vars prefixed with VITE_ to client code
// Fallback to hardcoded values (project ID is public, not sensitive)
const projectId = import.meta.env?.VITE_SANITY_PROJECT_ID || 'r869qm8k'
const dataset = import.meta.env?.VITE_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'metaspn-blog',
  title: 'MetaSPN Blog',
  
  projectId,
  dataset,
  
  // basePath is only set during build, not for local dev
  // This prevents "Tool not found: studio" errors
  
  plugins: [structureTool(), visionTool()],
  
  schema: {
    types: [
      {
        name: 'post',
        title: 'Blog Post',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'Meta description for SEO',
            validation: (Rule) => Rule.required().max(160),
          },
          {
            name: 'keywords',
            title: 'Keywords',
            type: 'string',
            description: 'Comma-separated keywords for SEO',
          },
          {
            name: 'author',
            title: 'Author',
            type: 'string',
            default: 'Leo Guinan',
          },
          {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'modifiedAt',
            title: 'Modified At',
            type: 'datetime',
          },
          {
            name: 'featuredImage',
            title: 'Featured Image',
            type: 'image',
            options: {
              hotspot: true,
            },
            fields: [
              {
                name: 'alt',
                title: 'Alt Text',
                type: 'string',
              },
            ],
          },
          {
            name: 'ogImage',
            title: 'Open Graph Image',
            type: 'image',
            description: 'Optional: Custom OG image (defaults to featured image)',
            options: {
              hotspot: true,
            },
          },
          {
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{type: 'string'}],
            options: {
              layout: 'tags',
            },
          },
          {
            name: 'readTime',
            title: 'Read Time (minutes)',
            type: 'number',
            description: 'Estimated reading time',
          },
          {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
              {
                type: 'block',
                styles: [
                  {title: 'Normal', value: 'normal'},
                  {title: 'H2', value: 'h2'},
                  {title: 'H3', value: 'h3'},
                  {title: 'H4', value: 'h4'},
                  {title: 'Quote', value: 'blockquote'},
                ],
                marks: {
                  decorators: [
                    {title: 'Strong', value: 'strong'},
                    {title: 'Emphasis', value: 'em'},
                    {title: 'Code', value: 'code'},
                  ],
                  annotations: [
                    {
                      name: 'link',
                      type: 'object',
                      fields: [
                        {
                          name: 'href',
                          type: 'url',
                        },
                        {
                          name: 'openInNewTab',
                          title: 'Open in New Tab',
                          type: 'boolean',
                          default: true,
                        },
                      ],
                    },
                  ],
                },
              },
              {
                type: 'image',
                fields: [
                  {
                    name: 'alt',
                    title: 'Alt Text',
                    type: 'string',
                  },
                  {
                    name: 'caption',
                    title: 'Caption',
                    type: 'string',
                  },
                ],
              },
            ],
          },
          {
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            description: 'Short excerpt for blog index page',
            validation: (Rule) => Rule.max(200),
          },
        ],
        preview: {
          select: {
            title: 'title',
            media: 'featuredImage',
            publishedAt: 'publishedAt',
          },
          prepare({title, media, publishedAt}) {
            return {
              title,
              media,
              subtitle: publishedAt
                ? new Date(publishedAt).toLocaleDateString()
                : 'Not published',
            }
          },
        },
      },
    ],
  },
})

