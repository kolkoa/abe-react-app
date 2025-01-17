// src/components/ImageGenerator.tsx
import { useState } from 'react'
import { StyleSelector } from './StyleSelector'
import { RECRAFT_STYLES } from '../config/styles'

export function ImageGenerator() {
  // Move all state and functions from App.tsx
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(RECRAFT_STYLES[0].value)

  // Move all the existing functions
  const handleSubmit = async () => {
    // ... existing handleSubmit code ...
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Move the existing JSX return
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