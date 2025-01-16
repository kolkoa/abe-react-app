import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  BUCKET: R2Bucket;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const { env } = context;
    
    // Get filename from URL
    const url = new URL(context.request.url);
    const filename = url.pathname.split('/').pop();

    if (!filename) {
      return new Response('No filename provided', { status: 400 });
    }

    // Get object from R2
    const object = await env.BUCKET.get(filename);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    // Return image with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('R2 serve error:', error);
    return new Response('Failed to serve image', { status: 500 });
  }
};