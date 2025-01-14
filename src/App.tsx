import { useState } from 'react'
import './App.css'
import { StyleSelector } from './components/StyleSelector'
import { RECRAFT_STYLES } from './config/styles'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(RECRAFT_STYLES[0].value) // Default to first style

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')

    try {
      console.log('Sending prompt:', prompt);
      console.log('Using style:', selectedStyle);
      
      const requestBody = JSON.stringify({ 
        prompt,
        style: selectedStyle  // Use selected style instead of hardcoded value
      });
      console.log('Request body:', requestBody);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.url) {
        setImageUrl(data.url);
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