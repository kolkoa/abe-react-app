export const onRequestPost = async (context: { request: Request; env: any }) => {
  try {
    console.log('Request method:', context.request.method);
    
    const { prompt } = await context.request.json();
    console.log('Received prompt:', prompt);

    const podResponse = await fetch('https://image-api.abushstable555.xyz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    console.log('Pod API status:', podResponse.status);

    // Our API returns the image directly
    const imageBlob = await podResponse.blob();
    
    return new Response(imageBlob, {
      headers: {
        'Content-Type': 'image/png'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};