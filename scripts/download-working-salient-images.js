#!/usr/bin/env node

/**
 * Download working Salient Photography demo images
 * Perfect test dataset for masonry replication
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const downloadDir = path.join(__dirname, '../public/salient-demo-images');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Working images from Salient Photography demo
const workingImages = [
  // Regular size (450x600) - Portrait 3:4 ratio
  {
    name: 'fashion-portrait',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/10-450x600.jpg',
    category: 'regular',
    size: '450x600',
    gridSize: '1x1'
  },
  {
    name: 'restaurant-scene', 
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/19-450x600.jpg',
    category: 'regular',
    size: '450x600', 
    gridSize: '1x1'
  },
  {
    name: 'abstract-art',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/12-450x600.jpg',
    category: 'regular',
    size: '450x600',
    gridSize: '1x1'
  },
  
  // Wide size (900x600) - Landscape 3:2 ratio, double width
  {
    name: 'swimming-pool',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/13-900x600.jpg', 
    category: 'wide',
    size: '900x600',
    gridSize: '2x1'
  },
  {
    name: 'nature-landscape',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/27-900x600.jpg',
    category: 'wide', 
    size: '900x600',
    gridSize: '2x1'
  },
  
  // Wide & Tall size (900x1200) - Portrait 3:4 ratio, double width & height
  {
    name: 'featured-portrait-1',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/9-900x1200.jpg',
    category: 'wide_tall',
    size: '900x1200', 
    gridSize: '2x2'
  },
  {
    name: 'featured-portrait-2',
    url: 'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/8-900x1200.jpg',
    category: 'wide_tall',
    size: '900x1200',
    gridSize: '2x2'
  }
];

function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const fileName = `${imageData.name}-${imageData.size}.jpg`;
    const filePath = path.join(downloadDir, fileName);
    
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
        console.log(`✓ Downloaded ${fileName} (${imageData.category} - ${imageData.gridSize})`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Generate comprehensive metadata for masonry testing
function generateMasonryMetadata() {
  const metadata = {
    source: 'Salient Photography Demo - Working Test Dataset',
    url: 'https://themenectar.com/salient/photography/',
    downloadDate: new Date().toISOString(),
    description: 'Perfect test case for replicating Salient Photography masonry behavior',
    masonrySpecs: {
      system: 'Photography-based',
      aspectRatios: {
        regular: '3:4 (450×600)',
        wide: '3:2 (900×600)', 
        wide_tall: '3:4 (900×1200)'
      },
      gridMapping: {
        regular: '1×1 grid units',
        wide: '2×1 grid units (double width)',
        wide_tall: '2×2 grid units (double width & height)'
      }
    },
    images: workingImages.map(img => ({
      filename: `${img.name}-${img.size}.jpg`,
      originalName: img.name,
      category: img.category,
      dimensions: img.size,
      gridSize: img.gridSize,
      aspectRatio: img.category === 'wide' ? '3:2' : '3:4',
      masonryClass: `elastic-portfolio-item ${img.category}`
    })),
    testLayout: [
      // Example masonry arrangement 
      '┌─────────┬─────────┬─────────────────┐',
      '│ Regular │ Regular │      Wide       │',
      '├─────────┼─────────┼─────────────────┤', 
      '│ Regular │         │                 │',
      '├─────────┤ Wide &  │   Wide & Tall   │',
      '│ Regular │  Tall   │                 │',
      '├─────────┤         │                 │',
      '│ Regular │         │                 │',
      '└─────────┴─────────┴─────────────────┘'
    ]
  };

  const metadataPath = path.join(downloadDir, 'masonry-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('\n✓ Generated masonry-metadata.json');
  
  // Also create a simple array for quick use
  const simpleList = workingImages.map(img => ({
    src: `${img.name}-${img.size}.jpg`,
    size: img.category,
    width: parseInt(img.size.split('x')[0]),
    height: parseInt(img.size.split('x')[1])
  }));
  
  const simpleListPath = path.join(downloadDir, 'images.json');
  fs.writeFileSync(simpleListPath, JSON.stringify(simpleList, null, 2));
  console.log('✓ Generated images.json');
}

async function main() {
  console.log('🖼️  Downloading Salient Photography demo test images...\n');
  
  try {
    for (const imageData of workingImages) {
      await downloadImage(imageData);
    }
    
    generateMasonryMetadata();
    
    console.log(`\n🎉 Perfect test dataset ready!`);
    console.log(`📁 Location: ${downloadDir}`);
    console.log('\n📊 Masonry test breakdown:');
    console.log(`   Regular (1×1): ${workingImages.filter(i => i.category === 'regular').length} images`);
    console.log(`   Wide (2×1): ${workingImages.filter(i => i.category === 'wide').length} images`);
    console.log(`   Wide & Tall (2×2): ${workingImages.filter(i => i.category === 'wide_tall').length} images`);
    console.log('\n✨ Ready to test exact Salient masonry replication!');
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    process.exit(1);
  }
}

main();