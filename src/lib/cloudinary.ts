const CLOUD = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const TRANSFORM = import.meta.env.PUBLIC_CLOUDINARY_TRANSFORM || 'gallery';

function ensureEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

ensureEnv('PUBLIC_CLOUDINARY_CLOUD_NAME', CLOUD);

export function cldUrl(publicId: string, width?: number) {
  const base = `https://res.cloudinary.com/${CLOUD}/image/upload`;
  const transform = width ? `t_${TRANSFORM},w_${width}` : `t_${TRANSFORM}`;
  return `${base}/${transform}/${publicId}`;
}

export function cldSrcset(publicId: string, widths: number[] = [480, 768, 1024, 1600, 2200]) {
  return widths.map((w) => `${cldUrl(publicId, w)} ${w}w`).join(', ');
}

export function cldSizes(
  sizes: string = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
) {
  return sizes;
}

