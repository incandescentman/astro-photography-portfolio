import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const data = await request.json();
    const { order } = data;
    
    if (!Array.isArray(order)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid order format',
          details: 'Expected order to be an array'
        }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Save the order to a JSON file
    const orderFilePath = path.join(process.cwd(), 'src/data/saved-order.json');
    await fs.writeFile(orderFilePath, JSON.stringify(order, null, 2), 'utf-8');
    
    console.log('Saved photo sequence:', order.length, 'items');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sequence saved successfully',
        count: order.length,
        note: 'Saved to src/data/saved-order.json'
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Error saving sequence:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save sequence',
        details: error.message 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
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