import type { APIRoute } from 'astro';
import { images as homepageImages } from '../data/homepage-images.js';
import imageMetadata from '../data/image-metadata.json';

const SITE_FALLBACK = 'https://photos.jaydixit.com';

type ImageConfig = (typeof homepageImages)[number];

const toAbsolute = (siteUrl: string, path: string) => new URL(path, siteUrl).toString();

const getDimensions = (filename: string, size: ImageConfig['size']) => {
  const key = `highlights/${filename}`;
  const meta = imageMetadata[key] as { width?: number; height?: number } | undefined;

  const fallback = {
    portrait: { width: 2048, height: 2560 },
    landscape: { width: 2560, height: 1707 },
    xlportrait: { width: 2560, height: 3200 },
  } as const;

  return {
    width: meta?.width ?? fallback[size as keyof typeof fallback].width,
    height: meta?.height ?? fallback[size as keyof typeof fallback].height,
  };
};

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin ?? SITE_FALLBACK;

  const ordered = homepageImages
    .slice()
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

  const items = ordered.slice(0, 20).map((entry) => {
    const { width, height } = getDimensions(entry.filename, entry.size);
    const absoluteImage = toAbsolute(siteUrl, `/highlights/${entry.filename}`);
    const webpImage = absoluteImage.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    return {
      id: absoluteImage,
      url: absoluteImage,
      canonical: absoluteImage,
      caption: entry.caption ?? entry.filename,
      variant: entry.size,
      width,
      height,
      webp: webpImage,
    };
  });

  return new Response(
    JSON.stringify(
      {
        title: 'Jay Dixit Photos — Highlight Feed',
        home: siteUrl,
        feed_url: toAbsolute(siteUrl, '/highlights.json'),
        items,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=900',
      },
    },
  );
};
