import { useState } from 'react'
import './App.css'
import { StyleSelector } from './components/StyleSelector'
import { RECRAFT_STYLES } from './config/styles'

interface RecraftResponse {
  url: string;
}

interface R2UploadResponse {
  success: boolean;
  filename: string;
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(RECRAFT_STYLES[0].value)
  const [r2Status, setR2Status] = useState('')

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')
    setR2Status('')

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          style: selectedStyle
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RecraftResponse;
      
      if (data.url) {
        setImageUrl(data.url);

        try {
          const imageResponse = await fetch(data.url);
          const imageBlob = await imageResponse.blob();

          const formData = new FormData();
          formData.append('image', imageBlob, 'generated-image.png');

          setR2Status('Uploading to R2...');
          
          const r2Response = await fetch('/api/r2-upload', {
            method: 'POST',
            body: formData
          });

          if (!r2Response.ok) {
            throw new Error('R2 upload failed');
          }

          const r2Data = await r2Response.json() as R2UploadResponse;
          setR2Status(`Saved to R2: ${r2Data.filename}`);
        } catch (r2Error) {
          console.error('R2 upload error:', r2Error);
          setR2Status('Failed to save to R2');
        }
      } else {
        setError('Failed to generate image');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error: ' + (err instanceof Error ? err.message : String(err)));
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
      <h1>Image Generator (Staging)</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
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
      {r2Status && <div style={{ color: 'blue', marginTop: '10px' }}>{r2Status}</div>}
      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  )
}

export default App