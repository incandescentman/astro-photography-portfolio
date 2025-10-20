#!/usr/bin/env node

/**
 * Upload photos to Cloudinary with metadata extraction from EXIF/IPTC
 * 
 * Usage:
 *   node scripts/upload-with-metadata.js <sourceDir> [cloudinaryFolder]
 * 
 * Example:
 *   node scripts/upload-with-metadata.js ./src/gallery/photos/red-carpet/tiff-2025
 *   node scripts/upload-with-metadata.js ./src/gallery/photos/portraits portraits
 * 
 * Prerequisites:
 *   - brew install exiftool
 *   - npm install cloudinary execa fast-glob dotenv
 */

import { v2 as cloudinary } from 'cloudinary';
import fg from 'fast-glob';
import { execa } from 'execa';
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
Usage: node scripts/upload-with-metadata.js <sourceDir> [cloudinaryFolder]

Examples:
  node scripts/upload-with-metadata.js ./src/gallery/photos
  node scripts/upload-with-metadata.js ./src/gallery/photos/red-carpet/tiff-2025 photos/red-carpet/tiff-2025
  `);
  process.exit(1);
}

const ROOT = path.resolve(sourceDir);
const UPLOAD_FOLDER = cloudinaryFolder || sourceDir
  .replace(/^\.\//, '')
  .replace(/^public\//, '')
  .replace(/^src\/gallery\//, '');

/**
 * Read EXIF/IPTC metadata using exiftool
 */
async function readExifToolJSON(file) {
  try {
    const { stdout } = await execa('exiftool', ['-json', file]);
    const arr = JSON.parse(stdout);
    return arr[0] || {};
  } catch (e) {
    console.warn(`Could not read metadata for ${file}:`, e.message);
    return {};
  }
}

/**
 * Extract relevant metadata and map to Cloudinary tags/context
 */
function extractMetadata(meta, filename) {
  const m = meta || {};
  
  // Extract keywords/tags
  const keywords = m['XMP-dc:Subject'] || m['IPTC:Keywords'] || m['Keywords'] || [];
  const tags = Array.isArray(keywords) 
    ? keywords 
    : String(keywords).split(/[;,]/).map(s => s.trim()).filter(Boolean);
  
  // Extract caption/title
  const title = m['XMP-dc:Title'] || m['IPTC:ObjectName'] || m['Title'];
  const caption = m['IPTC:Caption-Abstract'] || m['XMP:Description'] || 
                  m['XMP-dc:Description'] || m['ImageDescription'];
  
  // Extract people
  const people = m['IPTC:PersonInImage'] || m['XMP-iptcExt:PersonInImage'] || 
                 m['XMP-iptcCore:PersonInImage'] || m['PersonInImage'] || [];
  
  // Extract location
  const city = m['IPTC:City'] || m['XMP-photoshop:City'] || m['City'];
  const state = m['IPTC:Province-State'] || m['XMP-photoshop:State'] || m['State'];
  const country = m['IPTC:Country-PrimaryLocationName'] || 
                  m['XMP-photoshop:Country'] || m['Country'];
  const gpsLat = m['EXIF:GPSLatitude'] || m['GPSLatitude'];
  const gpsLng = m['EXIF:GPSLongitude'] || m['GPSLongitude'];
  
  // Extract credit/copyright
  const credit = m['IPTC:Credit'] || m['XMP-photoshop:Credit'] || 
                 m['IPTC:By-line'] || m['Artist'] || m['Creator'];
  const copyright = m['IPTC:CopyrightNotice'] || m['Copyright'];
  
  // Extract event info
  const event = m['IPTC:Category'] || m['XMP-photoshop:Category'];
  const date = m['IPTC:DateCreated'] || m['CreateDate'] || m['DateTimeOriginal'];
  
  // Build context object (key-value pairs in Cloudinary)
  const context = {};
  if (title) context.title = Array.isArray(title) ? title[0] : String(title);
  if (caption) context.caption = Array.isArray(caption) ? caption[0] : String(caption);
  if (city) context.city = String(city);
  if (state) context.state = String(state);
  if (country) context.country = String(country);
  if (people && people.length) {
    context.people = (Array.isArray(people) ? people : [people]).join(', ');
  }
  if (gpsLat && gpsLng) {
    context.gps = `${gpsLat},${gpsLng}`;
  }
  if (credit) context.credit = String(credit);
  if (copyright) context.copyright = String(copyright);
  if (event) context.event = String(event);
  if (date) context.date = String(date);
  
  // Parse filename for additional tags if no metadata
  if (tags.length === 0) {
    // Extract tags from filename pattern: subject_event_year.jpg
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 2) {
      // Add subject name as tag
      const subject = parts[0].replace(/-/g, ' ');
      tags.push(subject);
      
      // Add event as tag
      const event = parts[1].replace(/-/g, ' ');
      tags.push(event);
      
      // Add year if present
      const yearMatch = nameWithoutExt.match(/\d{4}/);
      if (yearMatch) {
        tags.push(yearMatch[0]);
      }
    }
  }
  
  return { tags, context };
}

/**
 * Check if ExifTool is installed
 */
async function checkExifTool() {
  try {
    await execa('exiftool', ['-ver']);
    return true;
  } catch {
    console.error(`
ExifTool is not installed. Please install it first:
  brew install exiftool

Or download from: https://exiftool.org/
`);
    return false;
  }
}

/**
 * Main upload function
 */
async function uploadPhotos() {
  // Check prerequisites
  if (!(await checkExifTool())) {
    process.exit(1);
  }
  
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
  
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  
  for (const [index, file] of files.entries()) {
    const progress = `[${index + 1}/${files.length}]`;
    const relativePath = path.relative(ROOT, file);
    
    console.log(`${progress} Processing: ${relativePath}`);
    
    // Read metadata
    const meta = await readExifToolJSON(file);
    const { tags, context } = extractMetadata(meta, file);
    
    // Prepare public_id (preserves folder structure)
    const publicId = relativePath.replace(/\.[^.]+$/, '');
    
    try {
      // Check if already exists (optional - remove if you want to always overwrite)
      const existingResource = await cloudinary.api.resource(
        `${UPLOAD_FOLDER}/${publicId}`,
        { type: 'upload' }
      ).catch(() => null);
      
      if (existingResource && !process.env.FORCE_OVERWRITE) {
        console.log(`  → Skipped (already exists)`);
        skipCount++;
        continue;
      }
      
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
        image_metadata: true, // Include EXIF in response
      });
      
      console.log(`  → Uploaded: ${result.public_id}`);
      if (tags.length > 0) console.log(`    Tags: ${tags.join(', ')}`);
      if (context.caption) console.log(`    Caption: ${context.caption}`);
      
      successCount++;
      
      // Show progress every 10 uploads
      if ((successCount + failCount) % 10 === 0) {
        console.log(`\nProgress: ${successCount} uploaded, ${failCount} failed, ${skipCount} skipped\n`);
      }
    } catch (error) {
      console.error(`  → Failed: ${error.message}`);
      failCount++;
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('Upload Complete!');
  console.log(`✓ Uploaded: ${successCount}`);
  if (skipCount > 0) console.log(`⊝ Skipped: ${skipCount}`);
  if (failCount > 0) console.log(`✗ Failed: ${failCount}`);
  console.log('='.repeat(60));
}

// Run the upload
uploadPhotos().catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
});
