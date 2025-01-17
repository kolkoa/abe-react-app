// functions/api/serve-gallery.ts
export interface Env {
    DB: D1Database
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    try {
      const { DB } = context.env
  
      // Get most recent image info from DB
      const imageData = await DB
        .prepare(
          `SELECT r2_url, prompt, created_at 
           FROM images 
           ORDER BY created_at DESC 
           LIMIT 1`
        )
        .first()
  
      if (!imageData) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'No images found in database'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
  
      return new Response(JSON.stringify({
        status: 'success',
        data: imageData
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
    } catch (error) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to serve image',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }