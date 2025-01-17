// src/components/ImageGenerator.tsx
import { useState } from 'react'
import { StyleSelector } from './StyleSelector'
import { RECRAFT_STYLES } from '../config/styles'

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(RECRAFT_STYLES[0].value)

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const requestBody = JSON.stringify({ 
        prompt,
        style: selectedStyle
      });

      // First, generate image from Recraft
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.url) {
        // Temporarily show the Recraft URL while uploading to R2
        setImageUrl(data.url);
        const originalUrl = data.url;

        // Upload to R2
        const imageResponse = await fetch(data.url);
        const imageBlob = await imageResponse.blob();
        
        const uploadResponse = await fetch('/api/upload-r2', {
          method: 'POST',
          body: imageBlob
        });

        if (!uploadResponse.ok) {
          console.error('R2 upload failed:', await uploadResponse.text());
          throw new Error('Failed to upload to R2');
        }

        const uploadData = await uploadResponse.json();

        // Log to D1 only after successful R2 upload
        const dbResponse = await fetch('/api/log-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original_url: originalUrl,
            r2_filename: uploadData.key,
            r2_url: uploadData.url,
            prompt,
            style: selectedStyle
          })
        });

        if (!dbResponse.ok) {
          console.error('Database logging failed:', await dbResponse.text());
          throw new Error('Failed to log to database');
        }

        // Only after successful upload and logging, fetch from R2
        const serveResponse = await fetch('/api/serve-r2');
        if (serveResponse.ok) {
          const serveData = await serveResponse.json();
          setImageUrl(serveData.url); // Update image to show from R2
        } else {
          console.error('Failed to get R2 URL:', await serveResponse.text());
          // Don't throw error here - image is still visible from original URL
        }
      } else {
        setError('Failed to generate image');
      }
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
        <StyleSelector
          styles={RECRAFT_STYLES}
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
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