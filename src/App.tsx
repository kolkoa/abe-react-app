import { useState } from 'react'
import './App.css'
import { StyleSelector } from './components/StyleSelector'
import { RECRAFT_STYLES } from './config/styles'

function App() {
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
        setImageUrl(data.url);
        const originalUrl = data.url;

        const imageResponse = await fetch(data.url);
        const imageBlob = await imageResponse.blob();
        
        const uploadResponse = await fetch('/api/upload-r2', {
          method: 'POST',
          body: imageBlob
        });

        if (!uploadResponse.ok) {
          console.error('R2 upload failed:', await uploadResponse.text());
        } else {
          const uploadData = await uploadResponse.json();
          console.log('R2 upload successful:', uploadData);

          // Log to D1
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
          }
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

export default App