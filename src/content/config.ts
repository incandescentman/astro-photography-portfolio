import { defineCollection, z } from 'astro:content';

const blogPosts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    publishDate: z.coerce.date().optional(),
    updateDate: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
    image: z.string().optional(),
    imagePublicId: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
  }),
});

const albums = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    coverPublicId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    photos: z.array(
      z.object({
        publicId: z.string(),
        alt: z.string().default(''),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    ),
  }),
});

const pressKit = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    lastUpdated: z.coerce.date().optional(),
    contactEmail: z.string().optional(),
    heroShots: z
      .array(
        z.object({
          title: z.string(),
          caption: z.string().optional(),
          image: z.string(),
          downloadUrl: z.string().optional(),
        }),
      )
      .optional(),
    downloads: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    guidelines: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    quote: z
      .object({
        text: z.string(),
        attribution: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { albums, blog: blogPosts, press: pressKit };
