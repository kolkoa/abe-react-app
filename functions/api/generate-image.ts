interface Env {
    RECRAFT_API_KEY: string;
  }
  
  export const onRequestPost = async (context: { request: Request; env: Env }) => {
    try {
      // Log the request method to verify
      console.log('Request method:', context.request.method);
  
      // Get the prompt from the request body
      const { prompt } = await context.request.json();
  
      // Log to help debug
      console.log('Received prompt:', prompt);
      console.log('API Key exists:', !!context.env.RECRAFT_API_KEY);
  
      const recraftResponse = await fetch('https://external.api.recraft.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.env.RECRAFT_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          style: 'digital_illustration',
          n: 1,
          size: '1024x1024'
        })
      });
  
      // Log the response status
      console.log('Recraft API status:', recraftResponse.status);
  
      // Get the response data
      const data = await recraftResponse.json();
      
      // Log the response data
      console.log('Recraft API response:', data);
  
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
    } catch (error) {
      // Log the error
      console.error('Worker error:', error);
  
      return new Response(JSON.stringify({ 
        error: 'Failed to generate image',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  };