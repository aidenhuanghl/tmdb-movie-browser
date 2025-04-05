const moviesGrid = document.getElementById('movies-grid');
const loadingIndicator = document.querySelector('.loading');

// --- 关键：API Key 和基础 URL ---
// !!! 警告：直接将 API Key 写在这里非常不安全 !!!
// !!! 这只是为了本地测试，部署前必须移除 !!!
const ourApiUrl = '/api/getMovies'; // 相对路径即可

// 图片的基础 URL 和尺寸 (查阅 TMDb 配置 API 或文档得到)
const baseImageUrl = 'https://image.tmdb.org/t/p/';
const posterSize = 'w342'; // 选择一个合适的海报尺寸

// 异步函数获取并显示电影
async function fetchAndDisplayMovies() {
    try {
        loadingIndicator.style.display = 'block';

        // 调用我们自己的 Serverless Function
        const response = await fetch(ourApiUrl); // 不再需要 API Key！

        // 检查来自我们自己 API 的响应
        if (!response.ok) {
            // 尝试解析错误信息，如果我们的后端返回了 JSON 错误
            let errorMsg = `HTTP 错误! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || errorMsg;
            } catch (e) { /* 忽略解析错误 */ }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        // console.log("Data from our API:", data);

        // 假设我们的 API 直接返回了 TMDb 的数据结构
        displayMovies(data.results);

    } catch (error) {
        console.error('加载电影时出错:', error);
        moviesGrid.innerHTML = `<p class="error">加载电影失败: ${error.message}</p>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// 函数：将电影数据显示在页面上
function displayMovies(movies) {
    moviesGrid.innerHTML = ''; // 清空之前的加载提示或错误信息

    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p>没有找到热门电影。</p>';
        return;
    }

    movies.forEach(movie => {
        // 创建电影卡片元素
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // 构建完整的海报图片 URL (如果 poster_path 存在)
        const posterUrl = movie.poster_path
            ? `${baseImageUrl}${posterSize}${movie.poster_path}`
            : 'placeholder.png'; // 如果没有海报，可以准备一个占位图

        // 格式化评分 (保留一位小数)
        const rating = movie.vote_average.toFixed(1);

        // 填充电影卡片内容
        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title} 海报">
            <h3>${movie.title}</h3>
            <span class="rating">评分: ${rating}</span>
        `;

        // 将卡片添加到网格中
        moviesGrid.appendChild(movieCard);
    });
}

// 页面加载完成后开始获取数据
fetchAndDisplayMovies();