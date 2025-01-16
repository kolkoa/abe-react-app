interface Env {
    DB: D1Database;
  }
  
  interface ImageLogEntry {
    original_url: string;
    r2_filename: string;
    prompt: string;
    style: string;
  }
  
  export const onRequestPost = async (context: { request: Request; env: Env }) => {
    try {
      const { env } = context;
      
      // Get metadata from request
      const data = await context.request.json() as ImageLogEntry;
  
      // Store in D1
      await env.DB.prepare(
        'INSERT INTO images (original_url, r2_filename, prompt, style) VALUES (?, ?, ?, ?)'
      ).bind(
        data.original_url,
        data.r2_filename,
        data.prompt,
        data.style
      ).run();
  
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Image metadata logged successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('Database error:', error);
      return new Response('Failed to log image metadata', { status: 500 });
    }
  };