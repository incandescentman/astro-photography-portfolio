import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

// This endpoint only works in development mode
// In production, the site is static and cannot write files
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Robust body parsing: accept application/json or raw text JSON
    const contentType = request.headers.get('content-type') || '';
    let data: any = null;

    try {
      if (contentType.includes('application/json')) {
        data = await request.json();
      } else {
        const raw = await request.text();
        data = raw ? JSON.parse(raw) : null;
      }
    } catch (parseErr: any) {
      console.error('save-order: JSON parse error:', parseErr?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON', details: parseErr?.message || 'Could not parse request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Diagnostics
    try {
      const summary = Array.isArray(data)
        ? `array(len=${data.length})`
        : data && typeof data === 'object'
          ? `object(keys=${Object.keys(data).join(',')})`
          : `${typeof data}`;
      console.log('save-order: content-type=', contentType, ' body=', summary);
    } catch {}

    // Support multiple shapes: array body, { order: [...] }, or any object containing an array
    let order: any = null;
    if (Array.isArray(data)) {
      order = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray((data as any).order)) {
        order = (data as any).order;
      } else {
        // Fallback: pick the first array-valued property
        for (const [k, v] of Object.entries(data)) {
          if (Array.isArray(v)) { order = v; break; }
        }
      }
    }

    if (!Array.isArray(order)) {
      const diag = data && typeof data === 'object' ? Object.keys(data) : typeof data;
      return new Response(
        JSON.stringify({ error: 'Invalid order format', details: 'Expected body to be an array or { order: [...] }', diag }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save the order to a JSON file (includes size and caption)
    const orderFilePath = path.join(process.cwd(), 'src/data/saved-order.json');
    await fs.writeFile(orderFilePath, JSON.stringify(order, null, 2), 'utf-8');

    console.log('Saved photo sequence:', order.length, 'items');
    
    // Also update the homepage-images.js file if sizes have changed
    if (order.some(item => item.size)) {
      try {
        const imagesPath = path.join(process.cwd(), 'src/data/homepage-images.js');
        const imagesContent = await fs.readFile(imagesPath, 'utf-8');
        
        // Create a map of filename to size
        const sizeMap = new Map();
        order.forEach(item => {
          if (item.size) {
            sizeMap.set(item.filename, item.size);
          }
        });
        
        // Update sizes in the file
        let updatedContent = imagesContent;
        sizeMap.forEach((size, filename) => {
          const regex = new RegExp(`(filename: '${filename}'[^}]*?size: )'[^']*'`, 'g');
          updatedContent = updatedContent.replace(regex, `$1'${size}'`);
        });
        
        await fs.writeFile(imagesPath, updatedContent, 'utf-8');
        console.log('Updated homepage-images.js with new sizes');
      } catch (err) {
        console.error('Failed to update homepage-images.js:', err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Sequence saved successfully', count: order.length, note: 'Saved to src/data/saved-order.json' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving sequence:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save sequence', details: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      status: 'ready',
      message: 'Save order endpoint is available' 
    }), 
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
