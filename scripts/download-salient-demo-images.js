#!/usr/bin/env node

/**
 * Download all images from Salient Photography demo
 * To test exact masonry behavior replication
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create downloads directory
const downloadDir = path.join(__dirname, '../public/salient-demo-images');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Salient Photography demo images with their sizing categories
const demoImages = [
  // Regular size (450x600) - 3:4 aspect ratio
  {
    name: 'high-end-fashion',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/10-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'restaurant-week',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/19-450x600.jpg',
    category: 'regular', 
    size: '450x600'
  },
  {
    name: 'urban-lifestyle',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/18-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'portrait-session',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/17-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'fashion-portrait',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/16-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'creative-portrait',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/15-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'lifestyle-portrait',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/14-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'abstract-art',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/12-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },
  {
    name: 'nature-scene',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/11-450x600.jpg',
    category: 'regular',
    size: '450x600'
  },

  // Wide size (900x600) - 3:2 aspect ratio
  {
    name: 'claire-swimming',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/13-900x600.jpg',
    category: 'wide',
    size: '900x600'
  },
  {
    name: 'landscape-wide',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/20-900x600.jpg',
    category: 'wide',
    size: '900x600'
  },

  // Wide & Tall size (900x1200) - 3:4 aspect ratio, double height
  {
    name: 'featured-portrait',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/9-900x1200.jpg',
    category: 'wide_tall',
    size: '900x1200'
  },
  {
    name: 'hero-fashion',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/8-900x1200.jpg', 
    category: 'wide_tall',
    size: '900x1200'
  }
];

// Download function
function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const fileName = `${imageData.name}-${imageData.size}.jpg`;
    const filePath = path.join(downloadDir, fileName);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${fileName} already exists`);
      resolve();
      return;
    }

    console.log(`Downloading ${fileName}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(imageData.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${imageData.url}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${fileName} (${imageData.category})`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

// Generate metadata file for our masonry system
function generateMetadata() {
  const metadata = {
    source: 'Salient Photography Demo',
    url: 'https://themenectar.com/salient/photography/',
    downloadDate: new Date().toISOString(),
    images: demoImages.map(img => ({
      filename: `${img.name}-${img.size}.jpg`,
      originalName: img.name,
      category: img.category,
      dimensions: img.size,
      gridSize: img.category === 'regular' ? '1x1' : 
                img.category === 'wide' ? '2x1' : '2x2'
    }))
  };

  fs.writeFileSync(
    path.join(downloadDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log('\n✓ Generated metadata.json');
}

// Main execution
async function main() {
  console.log('🖼️  Downloading Salient Photography demo images...\n');
  
  try {
    // Download all images
    for (const imageData of demoImages) {
      await downloadImage(imageData);
    }
    
    // Generate metadata
    generateMetadata();
    
    console.log(`\n🎉 Successfully downloaded ${demoImages.length} images!`);
    console.log(`📁 Images saved to: ${downloadDir}`);
    console.log('\nSize breakdown:');
    console.log(`   Regular (450×600): ${demoImages.filter(i => i.category === 'regular').length} images`);
    console.log(`   Wide (900×600): ${demoImages.filter(i => i.category === 'wide').length} images`);
    console.log(`   Wide & Tall (900×1200): ${demoImages.filter(i => i.category === 'wide_tall').length} images`);
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    process.exit(1);
  }
}

main();