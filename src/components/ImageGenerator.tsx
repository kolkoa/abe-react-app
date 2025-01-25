// ImageGenerator.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ImageGenerator() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImageUrl(data.url);

    } catch (err) {
      console.error('Error details:', err);
      setError('Error generating image: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button 
          onClick={() => navigate('/gallery')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Gallery
        </button>
      </div>

      <h1>Image Generator</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your image prompt..."
          style={{ padding: '8px', width: '300px' }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit}
          style={{ padding: '8px' }}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Submit Prompt'}
        </button>
      </div>
      
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      
      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  )
}

// functions/api/images.ts
export const onRequestPost = async (context: { request: Request; env: any }) => {
  try {
    const { prompt } = await context.request.json();
    
    // Generate image from Pod API
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

    // Get the image data
    const imageBlob = await podResponse.blob();
    
    // Store in R2
    const imageKey = `${Date.now()}-${crypto.randomUUID()}.png`;
    await context.env.BUCKET.put(imageKey, imageBlob, {
      contentType: 'image/png'
    });

    // Create public URL
    const publicUrl = `${context.env.R2_PUBLIC_URL}/${imageKey}`;

    // Log to database
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

    // Return just the R2 URL
    return new Response(
      JSON.stringify({ 
        url: publicUrl,
        success: true 
      }),
      { 
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