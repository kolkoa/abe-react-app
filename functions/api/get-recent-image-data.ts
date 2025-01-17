// functions/api/get-recent-image-data.ts
export interface Env {
    DB: D1Database
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    try {
      const { DB } = context.env
  
      // Test DB connection with a simple query
      const testQuery = await DB
        .prepare('SELECT 1')
        .all()
  
      if (!testQuery.success) {
        throw new Error('Database connection test failed')
      }
  
      const connectionStatus = {
        dbConnection: 'Connected successfully to database',
        timestamp: new Date().toISOString()
      }
  
      return new Response(JSON.stringify(connectionStatus), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
    } catch (error) {
      const errorStatus = {
        dbConnection: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
  
      return new Response(JSON.stringify(errorStatus), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }