import { defineCollection, z } from 'astro:content';

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

export const collections = { albums };

