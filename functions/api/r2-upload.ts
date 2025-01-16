import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { env } = context;
    
    // Get the image data from the request
    const formData = await context.request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response('No image provided', { status: 400 });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    // Upload to R2
    await env.BUCKET.put(filename, imageFile, {
      contentType: 'image/png',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      filename 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload failed', { status: 500 });
  }
};