// src/components/Gallery.tsx
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface DbStatus {
  dbConnection: string
  error?: string
  timestamp: string
}

interface ImageData {
  r2_url: string
  prompt: string
  created_at: string
}

export function Gallery() {
    const navigate = useNavigate()
    const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
    const [images, setImages] = useState<ImageData[]>([])
    const [imageError, setImageError] = useState<string | null>(null)

    useEffect(() => {
        const checkDatabase = async () => {
            try {
                const response = await fetch('/api/get-recent-image-data')
                const data = await response.json()
                setDbStatus(data)
            } catch (error) {
                setDbStatus({
                    dbConnection: 'Failed to fetch database status',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                })
            }
        }

        const fetchImages = async () => {
            try {
                const response = await fetch('/api/serve-gallery')
                const data = await response.json()
                if (data.status === 'success') {
                    setImages(data.data.slice(0, 3))
                } else {
                    setImageError(data.message)
                }
            } catch (error) {
                setImageError('Failed to fetch images')
            }
        }

        checkDatabase()
        fetchImages()
    }, [])
    
    return (
        <div style={{ minHeight: '100vh' }}>
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
            
            <div style={{
                margin: '20px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
            }}>
                <h3>Debug Information</h3>
                <div>
                    <h4>Database Status:</h4>
                    {dbStatus ? (
                        <div>
                            <p>{dbStatus.dbConnection}</p>
                            {dbStatus.error && <p style={{ color: 'red' }}>Error: {dbStatus.error}</p>}
                            <p>Last checked: {new Date(dbStatus.timestamp).toLocaleString()}</p>
                        </div>
                    ) : (
                        <p>Checking database connection...</p>
                    )}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Image Data:</h4>
                    {imageError ? (
                        <p style={{ color: 'red' }}>{imageError}</p>
                    ) : (
                        <div>
                            <p>Number of images: {images.length}</p>
                            {images.map((image, index) => (
                                <div key={index} style={{ marginTop: '10px' }}>
                                    <p>Image {index + 1}:</p>
                                    <p>URL: {image.r2_url}</p>
                                    <p>Prompt: {image.prompt}</p>
                                    <p>Created: {new Date(image.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Simple row of 3 images */}
            <div style={{
                margin: '20px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
            }}>
                <h3>Recent Images</h3>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {images.map((image, index) => (
                        <div 
                            key={index}
                            style={{
                                flex: '1',
                                maxWidth: '300px'
                            }}
                        >
                            <img 
                                src={image.r2_url} 
                                alt={image.prompt}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px'
                                }}
                            />
                            <p style={{
                                margin: '8px 0',
                                color: 'white',
                                fontSize: '14px'
                            }}>
                                {image.prompt}
                            </p>
                            <p style={{
                                margin: '4px 0',
                                color: '#999',
                                fontSize: '12px'
                            }}>
                                {new Date(image.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}