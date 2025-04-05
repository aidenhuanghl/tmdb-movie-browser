// api/getMovies.js

// 使用 node-fetch 发送请求 (Vercel 环境内置或需要安装)
// 在较新 Node.js 版本 (Vercel 支持) 中，可以直接用全局 fetch
// 为了兼容性，我们用 node-fetch (如果本地测试需要 npm install node-fetch)
//import fetch from 'node-fetch'; // 或者如果 Vercel 环境支持全局 fetch，可能不需要这行

// 从环境变量读取 API Key (这是安全的方式!)
const apiKey = process.env.TMDB_API_KEY;
const baseApiUrl = 'https://api.themoviedb.org/3';

// Serverless Function 主处理函数
export default async function handler(request, response) {
    // 允许来自任何源的请求 (CORS) - 在生产环境中可能需要更严格的设置
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

     // 处理 OPTIONS 预检请求 (用于 CORS)
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // 检查 API Key 是否已配置
    if (!apiKey) {
        return response.status(500).json({ error: 'API Key 未配置' });
    }

    // 构建实际请求 TMDb 的 URL
    const popularMoviesUrl = `${baseApiUrl}/movie/popular?language=zh-CN&api_key=${apiKey}`;

    try {
        // 使用 fetch 调用 TMDb API (这是后端调用!)
        const tmdbResponse = await fetch(popularMoviesUrl);

        // 检查来自 TMDb 的响应
        if (!tmdbResponse.ok) {
            // 将 TMDb 的错误状态和信息传递给前端
            const errorData = await tmdbResponse.text(); // 获取错误文本
            console.error('TMDb API Error:', tmdbResponse.status, errorData);
            return response.status(tmdbResponse.status).json({
                error: `TMDb API 错误: ${tmdbResponse.status}`,
                message: errorData
            });
        }

        // 解析来自 TMDb 的 JSON 数据
        const data = await tmdbResponse.json();

        // 将获取到的数据成功返回给前端
        response.status(200).json(data);

    } catch (error) {
        console.error('Serverless function error:', error);
        // 返回通用服务器错误给前端
        response.status(500).json({ error: '服务器内部错误', message: error.message });
    }
}