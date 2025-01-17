export const onRequestPost = async (context: { 
  request: Request; 
  env: { 
    BUCKET: any;
    R2_PUBLIC_URL: string;
  } 
}) => {
  try {
    const imageData = await context.request.blob();
    const imageKey = `${Date.now()}-${crypto.randomUUID()}.png`;

    await context.env.BUCKET.put(imageKey, imageData, {
      contentType: 'image/png'
    });

    const publicUrl = `${context.env.R2_PUBLIC_URL}/${imageKey}`;

    // Create debug info
    const debugInfo = {
      key: imageKey,
      url: publicUrl,
      debug: {
        hasR2PublicUrl: !!context.env.R2_PUBLIC_URL,
        R2_PUBLIC_URL: context.env.R2_PUBLIC_URL,
        availableEnvVars: Object.keys(context.env)
      }
    };

    console.log('Debug Info:', debugInfo);

    return new Response(
      JSON.stringify(debugInfo), 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    const errorInfo = {
      error: 'Failed to upload to R2',
      debug: {
        errorMessage: error.message,
        hasR2PublicUrl: !!context.env.R2_PUBLIC_URL,
        availableEnvVars: Object.keys(context.env)
      }
    };

    console.error('Error Info:', errorInfo);

    return new Response(
      JSON.stringify(errorInfo), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};