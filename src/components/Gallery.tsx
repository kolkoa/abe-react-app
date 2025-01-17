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
                    setImages(data.data)
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
            
            <div style={{
                margin: '20px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
            }}>
                <h3>Database Connection Status</h3>
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

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                {imageError && (
                    <div style={{ color: 'red', textAlign: 'center', margin: '20px' }}>
                        {imageError}
                    </div>
                )}
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '30px',
                    padding: '20px 0'
                }}>
                    {images.map((image, index) => (
                        <div 
                            key={index}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'relative',
                                paddingBottom: '100%', // Makes it square
                            }}>
                                <img 
                                    src={image.r2_url} 
                                    alt={image.prompt}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <div style={{
                                padding: '12px'
                            }}>
                                <p style={{
                                    margin: '0',
                                    color: 'white',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {image.prompt}
                                </p>
                                <p style={{
                                    margin: '4px 0 0 0',
                                    color: '#999',
                                    fontSize: '12px'
                                }}>
                                    {new Date(image.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}