// API endpoint to save the canonical image order
// This updates the homepage-images.js file with the new order

import fs from 'fs/promises';
import path from 'path';

export async function POST({ request }) {
  try {
    const { order } = await request.json();
    
    if (!Array.isArray(order)) {
      return new Response(JSON.stringify({ error: 'Invalid order format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Read the current homepage-images.js file
    const filePath = path.join(process.cwd(), 'src/data/homepage-images.js');
    const currentContent = await fs.readFile(filePath, 'utf-8');
    
    // Parse the current images array
    const imagesMatch = currentContent.match(/export const images = \[([\s\S]*?)\];/);
    if (!imagesMatch) {
      throw new Error('Could not parse homepage-images.js');
    }
    
    // Create a map of current image data by caption
    const currentImages = eval('(' + '[' + imagesMatch[1] + ']' + ')');
    const imageMap = new Map();
    currentImages.forEach(img => {
      const caption = img.caption || img.filename.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
      imageMap.set(caption, img);
    });
    
    // Build new images array in the saved order
    const newImages = [];
    order.forEach((item, index) => {
      const imageData = imageMap.get(item.caption);
      if (imageData) {
        // Update the order property
        newImages.push({
          ...imageData,
          order: index + 1
        });
      }
    });
    
    // Format the new images array
    const formattedImages = newImages.map(img => {
      const lines = [];
      lines.push('  {');
      if (img.order) lines.push(`    order: ${img.order},`);
      lines.push(`    filename: '${img.filename}',`);
      lines.push(`    size: '${img.size}',`);
      if (img.caption) lines.push(`    caption: '${img.caption.replace(/'/g, "\\'")}'`);
      lines.push('  }');
      return lines.join('\\n');
    }).join(',\\n');
    
    // Build the new file content
    const newContent = `// Homepage Image Configuration
// Edit this file to control which images appear on the homepage and their sizes.
//
// Size Options:
// - \`portrait\` - Standard portrait size (1 column × 1 row)
// - \`landscape\` - Landscape/horizontal (2 columns × 1 row) 
// - \`xlportrait\` - Extra-large portrait (2 columns × 2 rows) - featured images
//
// Order Control:
// - Set \`order: 1, 2, 3...\` to force specific positions
// - Images without \`order\` will be auto-arranged by the optimizer
//
// Caption:
// - Provide a custom caption for each image
// - If not provided, the filename will be used (with dashes/underscores converted to spaces)

export const images = [
${formattedImages}
];
`;
    
    // Write the updated file
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order saved successfully',
      count: newImages.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error saving order:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save order',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Also support GET to check if the endpoint is working
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ready',
    message: 'Save order endpoint is available' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}