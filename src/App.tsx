import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')

    try {
      console.log('Sending prompt:', prompt);
      
      const requestBody = JSON.stringify({ prompt });
      console.log('Request body:', requestBody);

      const response = await fetch('/api/generate-image', {
        method: 'POST',  // Verify this is actually POST
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
      
      if (data.data && data.data[0].url) {
        setImageUrl(data.data[0].url);
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
      <div>
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
          style={{ marginLeft: '8px', padding: '8px' }}
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