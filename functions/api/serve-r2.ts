export const onRequestGet = async (context: {
    request: Request;
    env: {
      DB: D1Database;
    }
  }) => {
    try {
      // Get the latest image from D1
      const image = await context.env.DB.prepare(`
        SELECT r2_url
        FROM images
        ORDER BY created_at DESC
        LIMIT 1
      `).first();
  
      if (!image) {
        return new Response(
          JSON.stringify({ error: 'No images found' }), 
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
  
      return new Response(
        JSON.stringify({ url: image.r2_url }), 
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error serving R2 URL:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve image URL' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };