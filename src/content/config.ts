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

export const collections = { albums, blog: blogPosts };
