interface R2Response {
    url: string;
    key: string;
}

const PUBLIC_BUCKET_URL = 'https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev';

export async function uploadToR2(
    env: any,
    imageData: ArrayBuffer,
    filename: string,
    contentType: string = 'image/jpeg'
): Promise<R2Response> {
    try {
        console.log('Starting R2 upload:', {
            filename,
            dataSize: imageData.byteLength,
            hasStorage: !!env.image_generator_storage,
            contentType
        });

        // Log the actual image data
        console.log('Image data type:', typeof imageData);
        console.log('Image data is ArrayBuffer:', imageData instanceof ArrayBuffer);

        // Use the original file extension
        const extension = contentType.split('/')[1] || 'jpg';
        const finalFilename = `image-${Date.now()}.${extension}`;
        console.log('Final filename with extension:', finalFilename);

        // Attempt upload
        const uploadResult = await env.image_generator_storage.put(finalFilename, imageData, {
            httpMetadata: {
                contentType: contentType,
                cacheControl: 'public, max-age=31536000'
            }
        });
        console.log('Raw upload result:', uploadResult);

        // Verify the upload
        const checkObject = await env.image_generator_storage.get(finalFilename);
        console.log('Verification get result:', checkObject);

        if (!checkObject) {
            throw new Error('Upload verification failed - object not found');
        }

        const url = `${PUBLIC_BUCKET_URL}/${finalFilename}`;
        console.log('Upload complete, URL:', url);

        return { 
            url,
            key: finalFilename
        };
    } catch (error) {
        console.error('Storage error:', {
            message: error.message,
            stack: error.stack,
            type: error.constructor.name
        });
        throw error;
    }
}

export async function getImageFromR2(
    env: any,
    key: string
): Promise<R2Response | null> {
    try {
        const object = await env.image_generator_storage.get(key);
        
        if (!object) {
            return null;
        }

        return {
            url: `${PUBLIC_BUCKET_URL}/${key}`,
            key: key
        };
    } catch (error) {
        console.error('Storage retrieval error:', error);
        throw error;
    }
}