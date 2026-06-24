export const prerender = false;

export async function GET() {
  try {
    // Access the D1 binding
    const DB = env.DB; // This matches your wrangler.toml binding name

    if (!DB) {
      return new Response(
        JSON.stringify({
          status: 'info',
          message: 'D1 binding is undefined. Running in mock mode.',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Test the connection
    const result = await DB.prepare('SELECT 1 as test').first();

    return new Response(
      JSON.stringify({
        status: 'ok',
        d1_connected: !!result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    // Catches runtime errors (like the module not being available)
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}