export const onRequestPost = async (context: { 
  request: Request; 
  env: { 
    BUCKET: any;
    R2_PUBLIC_URL: string;
  } 
}) => {
  try {
    console.log('R2_PUBLIC_URL:', context.env.R2_PUBLIC_URL); // Add this debug line

    const imageData = await context.request.blob();
    const imageKey = `${Date.now()}-${crypto.randomUUID()}.png`;

    await context.env.BUCKET.put(imageKey, imageData, {
      contentType: 'image/png'
    });

    const publicUrl = `${context.env.R2_PUBLIC_URL}/${imageKey}`;
    console.log('Generated public URL:', publicUrl); // Add this debug line

    return new Response(
      JSON.stringify({
        key: imageKey,
        url: publicUrl
      }), 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('R2 upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload to R2' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};