// src/components/Gallery.tsx
import { useNavigate } from 'react-router-dom'

export function Gallery() {
    const navigate = useNavigate()
    
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Image Generator
          </button>
        </div>
  
        <h1>Gallery</h1>
        <div>Gallery content coming soon...</div>
      </div>
    )
}