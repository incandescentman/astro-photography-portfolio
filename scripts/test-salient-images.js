#!/usr/bin/env node

/**
 * Test what Salient demo images are actually available
 * And create a working test dataset
 */

import https from 'https';

// Test various image URLs to see what's available
const testUrls = [
  // Original full-size images
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/10.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/19.jpg', 
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/13.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/12.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/27.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/9.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/8.jpg',
  
  // Regular sized thumbnails (450x600)
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/10-450x600.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/19-450x600.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/12-450x600.jpg',
  
  // Wide sized thumbnails (900x600)
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/13-900x600.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/27-900x600.jpg',
  
  // Wide & Tall sized thumbnails (900x1200)
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/9-900x1200.jpg',
  'https://themenectar.com/salient/photography/wp-content/uploads/sites/12/2016/09/8-900x1200.jpg',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.request(url, { method: 'HEAD' }, (response) => {
      resolve({
        url,
        status: response.statusCode,
        contentLength: response.headers['content-length'],
        available: response.statusCode === 200
      });
    });
    
    request.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        available: false
      });
    });
    
    request.setTimeout(5000, () => {
      resolve({
        url,
        status: 'TIMEOUT', 
        available: false
      });
    });
    
    request.end();
  });
}

async function main() {
  console.log('Testing Salient demo image availability...\n');
  
  const results = [];
  for (const url of testUrls) {
    const result = await testUrl(url);
    results.push(result);
    
    const status = result.available ? '✓' : '✗';
    const size = result.contentLength ? `(${Math.round(result.contentLength/1024)}KB)` : '';
    console.log(`${status} ${result.status} ${url} ${size}`);
  }
  
  console.log('\nAvailable images by category:');
  
  const available = results.filter(r => r.available);
  const regular = available.filter(r => r.url.includes('450x600'));
  const wide = available.filter(r => r.url.includes('900x600')); 
  const wideTall = available.filter(r => r.url.includes('900x1200'));
  const fullSize = available.filter(r => !r.url.includes('-'));
  
  console.log(`Full-size: ${fullSize.length}`);
  console.log(`Regular (450x600): ${regular.length}`);
  console.log(`Wide (900x600): ${wide.length}`);
  console.log(`Wide & Tall (900x1200): ${wideTall.length}`);
}

main();