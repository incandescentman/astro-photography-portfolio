#!/usr/bin/env node

// Upload local images to Cloudinary preserving a folder structure.
// Usage:
//   node scripts/upload-to-cloudinary.js <sourceDir> [publicIdPrefix]
// Example:
//   node scripts/upload-to-cloudinary.js ./public/photos events
//
// Auth via either:
//   - CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
//   - or CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_CLOUD_NAME

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  console.error('Missing dependency: cloudinary. Install with: npm i cloudinary');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure from env
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true, cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
  cloudinary.config({
    secure: true,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_CLOUD_NAME,
  });
}

const [, , sourceArg, prefixArg] = process.argv;
if (!sourceArg) {
  console.log('Usage: node scripts/upload-to-cloudinary.js <sourceDir> [publicIdPrefix]');
  process.exit(1);
}

const sourceDir = path.resolve(sourceArg);
const prefix = prefixArg ? prefixArg.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') : '';

function isImage(file) {
  return /\.(jpe?g|png|gif|webp|tif?f)$/i.test(file);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (isImage(entry)) out.push(full);
  }
  return out;
}

async function run() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source not found: ${sourceDir}`);
    process.exit(1);
  }
  const files = walk(sourceDir);
  if (files.length === 0) {
    console.log('No images found.');
    return;
  }

  console.log(`Uploading ${files.length} images...`);

  let ok = 0;
  let fail = 0;
  for (const file of files) {
    const rel = path.relative(sourceDir, file);
    const withoutExt = rel.replace(/\.[^.]+$/, '');
    const publicId = [prefix, withoutExt.replace(/\\/g, '/')].filter(Boolean).join('/');
    try {
      await cloudinary.uploader.upload(file, {
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
      });
      ok++;
      if ((ok + fail) % 10 === 0) console.log(`Progress: ${ok} uploaded, ${fail} failed`);
    } catch (err) {
      fail++;
      console.warn(`Failed: ${rel} -> ${publicId}: ${err.message}`);
    }
  }

  console.log(`Done. Uploaded: ${ok}, Failed: ${fail}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

