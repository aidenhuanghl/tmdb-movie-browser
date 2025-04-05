// api/getMovies.js

// Uses global fetch available in modern Vercel/Node.js environments

const apiKey = process.env.TMDB_API_KEY;
const baseApiUrl = 'https://api.themoviedb.org/3';

export default async function handler(request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight requests for CORS
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Check if API Key is configured in environment variables
    if (!apiKey) {
        console.error("API Key not configured");
        return response.status(500).json({ error: 'API Key 未配置' });
    }

    // Get the 'page' query parameter from the request URL, default to 1
    const page = request.query.page || '1';

    // Construct the TMDb API URL with the page parameter
    const popularMoviesUrl = `${baseApiUrl}/movie/popular?language=zh-CN&page=${page}&api_key=${apiKey}`;

    try {
        // Call the TMDb API using global fetch
        const tmdbResponse = await fetch(popularMoviesUrl);

        // Check if the response from TMDb is okay
        if (!tmdbResponse.ok) {
            const errorData = await tmdbResponse.text(); // Get error text from TMDb
            console.error('TMDb API Error:', tmdbResponse.status, errorData);
            // Forward TMDb's error status and a generic message
            return response.status(tmdbResponse.status).json({
                error: `TMDb API 错误: ${tmdbResponse.status}`,
                message: `Failed to fetch from TMDb: ${tmdbResponse.statusText}`
            });
        }

        // Parse the JSON data from TMDb
        const data = await tmdbResponse.json();

        // Send the TMDb data back to the frontend client
        response.status(200).json(data);

    } catch (error) {
        console.error('Serverless function error:', error);
        // Send a generic server error response
        response.status(500).json({ error: '服务器内部错误', message: error.message });
    }
}