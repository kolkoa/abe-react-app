export const onRequestPost = async (context: { request: Request; env: { RECRAFT_API_KEY: string } }) => {
    try {
      console.log('Request method:', context.request.method);
      
      // Get both prompt and style from the request body
      const { prompt, style } = await context.request.json();
      console.log('Received prompt:', prompt);
      console.log('Received style:', style);
  
      console.log('API Key exists:', !!context.env.RECRAFT_API_KEY);
  
      const recraftResponse = await fetch('https://external.api.recraft.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.env.RECRAFT_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          style,  // Use the style from the request
          n: 1,
          size: '1024x1024'
        })
      });
  
      console.log('Recraft API status:', recraftResponse.status);
  
      const data = await recraftResponse.json();
      console.log('Recraft API response:', data);
  
      return new Response(JSON.stringify({
        url: data.data[0].url
      }), {
        headers: {
          'Content-Type': 'application/json'
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