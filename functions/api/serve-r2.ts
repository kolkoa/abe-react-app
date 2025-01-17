// functions/api/serve-gallery.ts
export interface Env {
    DB: D1Database
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    try {
      const { DB } = context.env
  
      // Get 12 most recent images
      const imageData = await DB
        .prepare(
          `SELECT r2_url, prompt, created_at 
           FROM images 
           ORDER BY created_at DESC 
           LIMIT 12`
        )
        .all()
  
      if (!imageData.results?.length) {
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
        data: imageData.results
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
    } catch (error) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to serve images',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }