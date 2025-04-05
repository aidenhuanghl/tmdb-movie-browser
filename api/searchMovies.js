// api/searchMovies.js
const apiKey = process.env.TMDB_API_KEY;
const baseApiUrl = 'https://api.themoviedb.org/3';

export default async function handler(request, response) {
    // CORS Headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (request.method === 'OPTIONS') { return response.status(200).end(); }

    if (!apiKey) {
        console.error("API Key not configured");
        return response.status(500).json({ error: 'API Key 未配置' });
    }

    // Get search query and page number
    const query = request.query.query;
    const page = request.query.page || '1';

    if (!query) {
        return response.status(400).json({ error: '缺少搜索关键词 (query) 参数' });
    }

    // Construct TMDb search URL - IMPORTANT: encode query
    const searchMoviesUrl = `${baseApiUrl}/search/movie?language=zh-CN&query=${encodeURIComponent(query)}&page=${page}&api_key=${apiKey}`;

    try {
        const tmdbResponse = await fetch(searchMoviesUrl);

        if (!tmdbResponse.ok) {
            const errorData = await tmdbResponse.text();
            console.error(`TMDb Search API Error for query "${query}":`, tmdbResponse.status, errorData);
            return response.status(tmdbResponse.status).json({
                error: `TMDb API 错误: ${tmdbResponse.status}`,
                message: `Failed to search from TMDb: ${tmdbResponse.statusText}`
            });
        }

        const data = await tmdbResponse.json();
        response.status(200).json(data); // Return search results

    } catch (error) {
        console.error(`Serverless function error for query "${query}":`, error);
        response.status(500).json({ error: '服务器内部错误', message: error.message });
    }
}