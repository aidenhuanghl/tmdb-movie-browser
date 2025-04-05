// api/getMovieDetails.js

// Uses global fetch available in modern Vercel/Node.js environments

const apiKey = process.env.TMDB_API_KEY;
const baseApiUrl = 'https://api.themoviedb.org/3';

export default async function handler(request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Check if API Key is configured
    if (!apiKey) {
        console.error("API Key not configured");
        return response.status(500).json({ error: 'API Key 未配置' });
    }

    // Get the movie ID 'id' from the query parameters
    const movieId = request.query.id;

    // Check if movieId is provided
    if (!movieId) {
        return response.status(400).json({ error: '缺少电影 ID (id) 参数' });
    }

    // Construct the TMDb API URL for specific movie details
    // Append 'credits' to get cast information
    const movieDetailUrl = `${baseApiUrl}/movie/${movieId}?language=zh-CN&append_to_response=credits&api_key=${apiKey}`;

    try {
        // Call the TMDb API
        const tmdbResponse = await fetch(movieDetailUrl);

        // Check if the response from TMDb is okay
        if (!tmdbResponse.ok) {
            const errorData = await tmdbResponse.text();
            console.error(`TMDb API Error for movie ${movieId}:`, tmdbResponse.status, errorData);
             // Specifically handle 404 Not Found from TMDb
            if (tmdbResponse.status === 404) {
               return response.status(404).json({ error: `找不到 ID 为 ${movieId} 的电影` });
            }
            // Forward other TMDb errors
            return response.status(tmdbResponse.status).json({
                error: `TMDb API 错误: ${tmdbResponse.status}`,
                message: `Failed to fetch details from TMDb: ${tmdbResponse.statusText}`
            });
        }

        // Parse the JSON data
        const data = await tmdbResponse.json();

        // Send the detailed movie data back to the frontend
        response.status(200).json(data);

    } catch (error) {
        console.error(`Serverless function error for movie ${movieId}:`, error);
        // Send a generic server error response
        response.status(500).json({ error: '服务器内部错误', message: error.message });
    }
}