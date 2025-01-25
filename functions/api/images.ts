export const onRequestPost = async (context: { request: Request; env: any }) => {
    try {
      const { prompt } = await context.request.json();
      
      // 1. Generate image from Pod API
      const podResponse = await fetch('https://image-api.abushstable555.xyz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
  
      if (!podResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate image' }), 
          { 
            status: podResponse.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
  
      // 2. Get image data
      const imageBlob = await podResponse.blob();
      
      // 3. Store in R2
      const imageKey = `${Date.now()}-${crypto.randomUUID()}.png`;
      await context.env.BUCKET.put(imageKey, imageBlob, {
        contentType: 'image/png'
      });
  
      // 4. Create public URL
      const publicUrl = `${context.env.R2_PUBLIC_URL}/${imageKey}`;
  
      // 5. Log to database
      await context.env.DB.prepare(`
        INSERT INTO images (
          r2_filename,
          r2_url,
          prompt,
          created_at
        ) VALUES (?, ?, ?, datetime('now'))
      `).bind(
        imageKey,
        publicUrl,
        prompt
      ).run();
  
      // 6. Return both the image data and the URL
      return new Response(
        JSON.stringify({ 
          url: publicUrl,
          success: true 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
  
    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: 'Image processing failed' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };