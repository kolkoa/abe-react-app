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

interface GalleryResponse {
  status: string
  data?: ImageData[]
  message?: string
  error?: string
}

export function Gallery() {
    const navigate = useNavigate()
    const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
    const [images, setImages] = useState<ImageData[]>([])
    const [imageError, setImageError] = useState<string | null>(null)
    const [fetchResponse, setFetchResponse] = useState<string>('No fetch attempt yet')

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
                setFetchResponse('Attempting to fetch from /api/serve-gallery...')
                const response = await fetch('/api/serve-gallery')
                const data: GalleryResponse = await response.json()
                setFetchResponse(JSON.stringify(data, null, 2))
                
                if (data.status === 'success' && Array.isArray(data.data)) {
                    setImages(data.data)
                } else {
                    setImageError(data.message || 'Failed to load images')
                }
            } catch (error) {
                setFetchResponse(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
                    <h4>Image Fetch Response:</h4>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        {fetchResponse}
                    </pre>
                </div>
            </div>

            {/* Grid of 12 images */}
            <div style={{
                margin: '20px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
            }}>
                <h3>Recent Images</h3>
                {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginTop: '20px',
                    maxWidth: '1200px',
                    margin: '20px auto'
                }}>
                    {images.map((image, index) => (
                        <div 
                            key={index}
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <img 
                                src={image.r2_url} 
                                alt={image.prompt}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    objectFit: 'cover'
                                }}
                            />
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