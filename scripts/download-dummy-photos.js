#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Photo data with realistic celebrity/event names
const photoSets = {
  'locarno-film-festival': [
    { filename: 'maria-bakalova_locarno_2024.jpg', seed: 100 },
    { filename: 'ana-de-armas_red-carpet_locarno_2024.jpg', seed: 101 },
    { filename: 'timothee-chalamet_press-conference_2024.jpg', seed: 102 },
    { filename: 'zendaya_premiere_locarno_2024.jpg', seed: 103 },
    { filename: 'oscar-isaac_interview_locarno_2024.jpg', seed: 104 }
  ],
  'cannes-2024': [
    { filename: 'emma-stone_cannes-premiere_2024_glamour-night.jpg', seed: 200 },
    { filename: 'ryan-gosling_interview_cannes_2024.jpg', seed: 201 },
    { filename: 'margot-robbie_red-carpet_cannes_2024.jpg', seed: 202 },
    { filename: 'brad-pitt_photo-call_cannes_2024.jpg', seed: 203 },
    { filename: 'scarlett-johansson_gala_cannes_2024.jpg', seed: 204 }
  ],
  'portraits': [
    { filename: 'portrait-session_studio_2024_moody-lighting.jpg', seed: 300 },
    { filename: 'creative-portrait_outdoor_2024_golden-hour.jpg', seed: 301 },
    { filename: 'editorial-shoot_fashion_2024_minimalist.jpg', seed: 302 },
    { filename: 'headshot-session_professional_2024_corporate.jpg', seed: 303 },
    { filename: 'artistic-portrait_conceptual_2024_dramatic.jpg', seed: 304 }
  ],
  'street-photography': [
    { filename: 'street-scene_downtown_2024_urban-life.jpg', seed: 400 },
    { filename: 'city-moments_evening_2024_street-lights.jpg', seed: 401 },
    { filename: 'urban-portrait_candid_2024_street-style.jpg', seed: 402 },
    { filename: 'metropolitan_rush-hour_2024_motion-blur.jpg', seed: 403 },
    { filename: 'neighborhood_community_2024_documentary.jpg', seed: 404 }
  ]
};

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file async
      reject(err);
    });
  });
}

async function generateDummyPhotos() {
  const galleryDir = path.join(process.cwd(), 'src/gallery');
  
  for (const [folderName, photos] of Object.entries(photoSets)) {
    const folderPath = path.join(galleryDir, folderName);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    console.log(`\nDownloading photos for ${folderName}...`);
    
    for (const photo of photos) {
      const filepath = path.join(folderPath, photo.filename);
      
      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`  ✓ ${photo.filename} (already exists)`);
        continue;
      }
      
      try {
        // Use Lorem Picsum with consistent seeds for realistic photos
        const width = Math.floor(Math.random() * 300) + 600; // 600-900px width
        const height = Math.floor(Math.random() * 400) + 800; // 800-1200px height
        const url = `https://picsum.photos/seed/${photo.seed}/${width}/${height}`;
        
        await downloadImage(url, filepath);
        console.log(`  ✓ ${photo.filename} (${width}x${height})`);
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`  ✗ Failed to download ${photo.filename}:`, error.message);
      }
    }
  }
  
  console.log('\n✓ Dummy photos generation complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run generate-tags src/gallery/locarno-film-festival');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:4321');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDummyPhotos().catch(console.error);
}
