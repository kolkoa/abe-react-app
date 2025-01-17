// functions/api/serve-gallery.ts
export interface Env {
    DB: D1Database
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    try {
      const { DB } = context.env
  
      const imageData = await DB
        .prepare(
          `SELECT r2_url, prompt, created_at 
           FROM images 
           ORDER BY created_at DESC 
           LIMIT 3`
        )
        .all()
  
      // Make sure we're sending an array in the data property
      return new Response(JSON.stringify({
        status: 'success',
        data: imageData.results  // .results contains the array from D1
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