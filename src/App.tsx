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
  const [dbStatus, setDbStatus] = useState('')

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')
    setR2Status('')
    setDbStatus('')

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
        // Initially show Recraft image
        setImageUrl(data.url);

        try {
          // Fetch and upload to R2
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

          // Log to D1
          setDbStatus('Logging metadata...');
          const dbResponse = await fetch('/api/db-log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              original_url: data.url,
              r2_filename: r2Data.filename,
              prompt: prompt,
              style: selectedStyle
            })
          });

          if (!dbResponse.ok) {
            throw new Error('Failed to log metadata');
          }

          setDbStatus('Metadata logged successfully');

          // Verify R2 upload before switching source
          setR2Status('Verifying R2 upload...');
          const verifyResponse = await fetch(`/api/r2-serve/${r2Data.filename}`);
          if (verifyResponse.ok) {
            setImageUrl(`/api/r2-serve/${r2Data.filename}`);
            setR2Status('Image serving from R2');
          } else {
            console.error('R2 serve verification failed');
            setR2Status('R2 verification failed - showing from Recraft');
            // Keep showing from Recraft URL
          }

        } catch (uploadError) {
          console.error('Upload/logging error:', uploadError);
          setR2Status('Failed to save to R2');
          setDbStatus('Failed to log metadata');
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
      {dbStatus && <div style={{ color: 'green', marginTop: '10px' }}>{dbStatus}</div>}
      
      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  )
}

export default App