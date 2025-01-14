import { uploadToR2 } from '../utils/storage';
import { saveImageMetadata } from '../utils/database';

interface Env {
    RECRAFT_API_KEY: string;
    DB: D1Database;
    image_generator_storage: R2Bucket;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
    try {
        // Get prompt and style from request
        const { prompt, style } = await context.request.json();
        console.log('Received request:', { prompt, style });

        // Generate image with Recraft
        const recraftResponse = await fetch('https://external.api.recraft.ai/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.env.RECRAFT_API_KEY}`
            },
            body: JSON.stringify({
                prompt,
                style,
                n: 1,
                size: '1024x1024'
            })
        });

        if (!recraftResponse.ok) {
            throw new Error('Failed to generate image from Recraft');
        }

        const recraftData = await recraftResponse.json();
        
        // Download image from Recraft
        const imageUrl = recraftData.data[0].url;
        console.log('Downloading from Recraft URL:', imageUrl);
        const imageResponse = await fetch(imageUrl);
        console.log('Image response status:', imageResponse.status);
        console.log('Image response headers:', Object.fromEntries(imageResponse.headers));
        
        // Get content type from response
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const imageData = await imageResponse.arrayBuffer();
        console.log('Downloaded image size:', imageData.byteLength);

        // Upload to R2 with correct content type
        const filename = `image-${Date.now()}`;  // Extension will be added in uploadToR2
        const r2Result = await uploadToR2(context.env, imageData, filename, contentType);

        // Save metadata to D1
        const metadata = {
            prompt,
            style,
            image_url: r2Result.url
        };
        console.log('Saving image metadata:', metadata);
        await saveImageMetadata(context.env, metadata);

        // Return the R2 URL
        return new Response(JSON.stringify({
            url: r2Result.url,
            prompt,
            style
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Failed to process image'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};