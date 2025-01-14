interface ImageMetadata {
    id?: number;
    prompt: string;
    style: string;
    image_url: string;
    created_at?: string;
}

export async function saveImageMetadata(env: any, data: ImageMetadata) {
    try {
        console.log('Saving image metadata:', data);
        
        const stmt = env.DB.prepare(
            'INSERT INTO image_metadata (prompt, style, image_url) VALUES (?, ?, ?)'
        ).bind(data.prompt, data.style, data.image_url);
        
        const result = await stmt.run();
        console.log('Database save result:', result);
        
        return { success: true, id: result.meta.last_row_id };
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save image metadata');
    }
}

export async function getRecentImages(env: any, limit: number = 10) {
    try {
        const stmt = env.DB.prepare(
            'SELECT * FROM image_metadata ORDER BY created_at DESC LIMIT ?'
        ).bind(limit);
        
        const result = await stmt.all();
        return result.results;
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to retrieve images');
    }
}