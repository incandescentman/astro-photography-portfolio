#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import fg from 'fast-glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const outputPath = path.join(projectRoot, 'src', 'data', 'image-metadata.json');

async function generateImageMetadata() {
  console.log('Starting image metadata generation...');
  console.log(`Scanning for images in: ${publicDir}`);

  try {
    const imagePaths = await fg('**/*.{jpg,jpeg,png,webp}', {
      cwd: publicDir,
      absolute: true,
    });

    if (imagePaths.length === 0) {
      console.log('No images found. Exiting.');
      return;
    }

    console.log(`Found ${imagePaths.length} images to process.`);

    const metadata = {};
    let processedCount = 0;

    await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          const image = sharp(imagePath);
          const { width, height } = await image.metadata();
          
          // Create a key relative to the 'public' directory
          const relativePath = path.relative(path.join(projectRoot, 'public'), imagePath);
          
          metadata[relativePath] = { width, height };

          // Convert to WebP
          const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          if (imagePath !== webpPath) { // Don't re-convert webp files
            await image.webp({ quality: 80 }).toFile(webpPath);
          }

          processedCount++;
          if (processedCount % 10 === 0) {
            console.log(`Processed ${processedCount}/${imagePaths.length}...`);
          }
        } catch (err) {
          console.error(`Error processing ${imagePath}:`, err);
        }
      })
    );

    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));

    console.log(`
Successfully generated metadata for ${processedCount} images.`);
    console.log(`Metadata saved to: ${outputPath}`);

  } catch (error) {
    console.error('An error occurred during metadata generation:', error);
    process.exit(1);
  }
}

generateImageMetadata();
