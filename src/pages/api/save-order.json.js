// API endpoint to save the canonical image order
// For now, just save to a JSON file since modifying JS files is complex

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
    
    // Save the order to a JSON file
    const orderFilePath = path.join(process.cwd(), 'src/data/saved-order.json');
    await fs.writeFile(orderFilePath, JSON.stringify(order, null, 2), 'utf-8');
    
    // Also log for debugging
    console.log('Saved photo sequence:', order.length, 'items');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sequence saved successfully',
      count: order.length,
      note: 'Saved to src/data/saved-order.json'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error saving sequence:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save sequence',
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