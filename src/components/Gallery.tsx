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
    const [imageData, setImageData] = useState<ImageData | null>(null)
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

        const fetchImage = async () => {
            try {
                const response = await fetch('/api/serve-gallery')
                const data = await response.json()
                if (data.status === 'success') {
                    setImageData(data.data)
                } else {
                    setImageError(data.message)
                }
            } catch (error) {
                setImageError('Failed to fetch image')
            }
        }

        checkDatabase()
        fetchImage()
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
                margin: '20px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
            }}>
                <h3>Most Recent Image</h3>
                {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
                {imageData && (
                    <div>
                        <img 
                            src={imageData.r2_url} 
                            alt={imageData.prompt}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '4px'
                            }}
                        />
                        <p>Prompt: {imageData.prompt}</p>
                        <p>Created: {new Date(imageData.created_at).toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    )
}