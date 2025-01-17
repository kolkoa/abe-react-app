export const onRequestPost = async (context: { 
    request: Request; 
    env: { 
      DB: D1Database;
    } 
  }) => {
    try {
      const {
        original_url,
        r2_filename,
        r2_url,
        prompt,
        style
      } = await context.request.json();
  
      await context.env.DB.prepare(`
        INSERT INTO images (
          original_url,
          r2_filename,
          r2_url,
          prompt,
          style,
          created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        original_url,
        r2_filename,
        r2_url,
        prompt,
        style
      ).run();
  
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('Database logging error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log to database' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };