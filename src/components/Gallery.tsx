// src/components/Gallery.tsx
export function Gallery() {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => console.log('Generator button clicked')}
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