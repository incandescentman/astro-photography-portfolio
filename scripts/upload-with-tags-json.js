#!/usr/bin/env node

/**
 * Upload photos to Cloudinary using tags.json sidecar files
 * 
 * Usage:
 *   node scripts/upload-with-tags-json.js <sourceDir> [cloudinaryFolder]
 * 
 * Example folder structure:
 *   photos/
 *     red-carpet/
 *       tiff-2025/
 *         tags.json
 *         maria-bakalova_tiff_2025.jpg
 *         jude-law_tiff_2025.jpg
 * 
 * Example tags.json:
 *   {
 *     "tags": ["red-carpet", "tiff", "2025"],
 *     "location": "Toronto, Canada",
 *     "captions": {
 *       "maria-bakalova_tiff_2025.jpg": "Maria Bakalova on the red carpet",
 *       "jude-law_tiff_2025.jpg": "Jude Law greeting fans"
 *     }
 *   }
 */

import { v2 as cloudinary } from 'cloudinary';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Parse command line arguments
const [,, sourceDir, cloudinaryFolder] = process.argv;

if (!sourceDir) {
  console.log(`
Usage: node scripts/upload-with-tags-json.js <sourceDir> [cloudinaryFolder]

Examples:
  node scripts/upload-with-tags-json.js ./public/photos
  node scripts/upload-with-tags-json.js ./photos/red-carpet photos/red-carpet
  `);
  process.exit(1);
}

const ROOT = path.resolve(sourceDir);
const UPLOAD_FOLDER = cloudinaryFolder || sourceDir.replace(/^\.\//, '').replace(/^public\//, '');

/**
 * Load tags.json from a directory
 */
async function loadTagsJson(dir) {
  const tagsPath = path.join(dir, 'tags.json');
  try {
    const content = await fs.readFile(tagsPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Parse tags from filename if no tags.json
 */
function parseFilename(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  const parts = nameWithoutExt.split('_');
  
  const tags = [];
  const context = {};
  
  if (parts.length >= 1) {
    // First part is usually the subject
    const subject = parts[0].replace(/-/g, ' ');
    tags.push(subject);
    context.subject = subject;
  }
  
  if (parts.length >= 2) {
    // Second part is usually the event
    const event = parts[1].replace(/-/g, ' ');
    tags.push(event);
    context.event = event;
  }
  
  // Extract year if present
  const yearMatch = nameWithoutExt.match(/\d{4}/);
  if (yearMatch) {
    tags.push(yearMatch[0]);
    context.year = yearMatch[0];
  }
  
  // Generate default caption
  if (parts.length >= 2) {
    const subject = parts[0].replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const event = parts[1].replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    context.caption = yearMatch 
      ? `${subject} at ${event} ${yearMatch[0]}`
      : `${subject} at ${event}`;
  }
  
  return { tags, context };
}

/**
 * Main upload function
 */
async function uploadPhotos() {
  // Check if source directory exists
  try {
    await fs.access(ROOT);
  } catch {
    console.error(`Source directory not found: ${ROOT}`);
    process.exit(1);
  }
  
  // Find all image files
  const patterns = [
    `${ROOT}/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}`,
    `${ROOT}/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}`
  ];
  
  const files = await fg(patterns, { 
    dot: false,
    unique: true,
    onlyFiles: true 
  });
  
  if (files.length === 0) {
    console.log('No images found in', ROOT);
    return;
  }
  
  console.log(`Found ${files.length} images to upload`);
  console.log(`Uploading to Cloudinary folder: ${UPLOAD_FOLDER}`);
  console.log('');
  
  // Group files by directory to load tags.json once per folder
  const filesByDir = {};
  for (const file of files) {
    const dir = path.dirname(file);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(file);
  }
  
  let successCount = 0;
  let failCount = 0;
  let fileIndex = 0;
  
  // Process each directory
  for (const [dir, dirFiles] of Object.entries(filesByDir)) {
    const relativeDir = path.relative(ROOT, dir);
    console.log(`\nProcessing folder: ${relativeDir || '(root)'}`);
    
    // Load tags.json for this directory
    const tagsData = await loadTagsJson(dir);
    
    if (tagsData) {
      console.log(`  Found tags.json with ${tagsData.tags?.length || 0} tags`);
    }
    
    // Process each file in the directory
    for (const file of dirFiles) {
      fileIndex++;
      const progress = `[${fileIndex}/${files.length}]`;
      const filename = path.basename(file);
      const relativePath = path.relative(ROOT, file);
      
      console.log(`${progress} Uploading: ${relativePath}`);
      
      // Determine tags and context
      let tags = [];
      let context = {};
      
      if (tagsData) {
        // Use tags from tags.json
        tags = tagsData.tags || [];
        
        // Add location to context
        if (tagsData.location) {
          const [city, country] = tagsData.location.split(',').map(s => s.trim());
          if (city) context.city = city;
          if (country) context.country = country;
        }
        
        // Add specific caption if available
        if (tagsData.captions && tagsData.captions[filename]) {
          context.caption = tagsData.captions[filename];
        }
        
        // Add any file-specific tags
        if (tagsData.files && tagsData.files[filename]) {
          const fileData = tagsData.files[filename];
          if (fileData.tags) {
            tags = [...tags, ...fileData.tags];
          }
          if (fileData.caption) {
            context.caption = fileData.caption;
          }
          if (fileData.people) {
            context.people = fileData.people;
          }
        }
      } else {
        // Parse from filename
        const parsed = parseFilename(file);
        tags = parsed.tags;
        context = parsed.context;
      }
      
      // Prepare public_id (preserves folder structure)
      const publicId = relativePath.replace(/\.[^.]+$/, '');
      
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
          folder: UPLOAD_FOLDER,
          public_id: publicId,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          resource_type: 'image',
          tags: tags.length > 0 ? tags : undefined,
          context: Object.keys(context).length > 0 ? context : undefined,
        });
        
        console.log(`  → Success: ${result.public_id}`);
        if (tags.length > 0) console.log(`    Tags: ${tags.join(', ')}`);
        if (context.caption) console.log(`    Caption: ${context.caption}`);
        
        successCount++;
      } catch (error) {
        console.error(`  → Failed: ${error.message}`);
        failCount++;
      }
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('Upload Complete!');
  console.log(`✓ Uploaded: ${successCount}`);
  if (failCount > 0) console.log(`✗ Failed: ${failCount}`);
  console.log('='.repeat(60));
}

// Run the upload
uploadPhotos().catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
});