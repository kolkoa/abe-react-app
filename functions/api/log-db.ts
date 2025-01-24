export const onRequestPost = async (context: { 
  request: Request; 
  env: { 
    DB: D1Database;
  } 
}) => {
  try {
    const {
      r2_filename,
      r2_url,
      prompt
    } = await context.request.json();

    await context.env.DB.prepare(`
      INSERT INTO images (
        r2_filename,
        r2_url,
        prompt,
        created_at
      ) VALUES (?, ?, ?, datetime('now'))
    `).bind(
      r2_filename,
      r2_url,
      prompt
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