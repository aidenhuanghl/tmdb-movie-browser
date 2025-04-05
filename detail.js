// detail.js
const detailContainer = document.getElementById('detail-container');
const movieTitleElement = document.getElementById('movie-title');
const baseImageUrl = 'https://image.tmdb.org/t/p/';
const posterSize = 'w342'; // Poster size for detail page
// const backdropSize = 'w780'; // Optional backdrop size

// Get movie ID from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

const ourDetailApiUrl = `/api/getMovieDetails?id=${movieId}`;

async function fetchAndDisplayDetails() {
    if (!movieId) {
        detailContainer.innerHTML = '<p class="error">错误：URL 中缺少电影 ID。</p>';
        movieTitleElement.textContent = '错误';
        return;
    }

    detailContainer.innerHTML = '<p class="loading">正在加载详情...</p>';

    try {
        const response = await fetch(ourDetailApiUrl);

        if (!response.ok) {
            let errorMsg = `HTTP 错误! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || errorMsg;
                 // Handle specific 404 from our API
                if (response.status === 404) {
                    errorMsg = errorData.error || `找不到 ID 为 ${movieId} 的电影。`;
                }
            } catch (e) { /* Ignore if response is not JSON */ }
            throw new Error(errorMsg);
        }

        const movie = await response.json();
        // console.log("Movie Details:", movie);
        displayDetails(movie);

    } catch (error) {
        console.error('加载电影详情时出错:', error);
        detailContainer.innerHTML = `<p class="error">加载详情失败: ${error.message}</p>`;
        movieTitleElement.textContent = '加载失败';
    }
}

function displayDetails(movie) {
    movieTitleElement.textContent = movie.title || '电影详情'; // Update page title

    const posterUrl = movie.poster_path
        ? `${baseImageUrl}${posterSize}${movie.poster_path}`
        : 'https://via.placeholder.com/342x513.png?text=No+Image'; // Placeholder

    // Process Genres
    const genresHtml = movie.genres && movie.genres.length > 0
        ? movie.genres.map(genre => `<span>${genre.name}</span>`).join(' ')
        : '类型未知';

    // Process Rating
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '无';
    const voteCount = movie.vote_count || 0;

    // Process Cast (requires 'credits' appended in API call)
    let castHtml = '暂无信息';
    if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
        castHtml = movie.credits.cast.slice(0, 10).map(actor => actor.name).join(', '); // Show top 10
         if (movie.credits.cast.length > 10) castHtml += ', ...';
    }

    // Format release date
    const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '未知年份';

    // Populate HTML
    detailContainer.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title} 海报" class="poster" loading="lazy">
        <div class="detail-content">
            <h2>${movie.title} (${releaseYear})</h2>
            <p><strong>评分:</strong> ${rating} / 10 (${voteCount} 票)</p>
            <p><strong>类型:</strong> <span class="genres">${genresHtml}</span></p>
            <p><strong>上映日期:</strong> ${movie.release_date || '未知'}</p>
            ${movie.runtime ? `<p><strong>片长:</strong> ${movie.runtime} 分钟</p>` : ''}
            ${movie.tagline ? `<p><em>${movie.tagline}</em></p>` : ''}
            <h3>剧情简介:</h3>
            <p>${movie.overview || '暂无简介'}</p>
            <h3>主演 (部分):</h3>
            <p>${castHtml}</p>
            ${movie.homepage ? `<p><strong>官方网站:</strong> <a href="${movie.homepage}" target="_blank" rel="noopener noreferrer">${movie.homepage}</a></p>` : ''}
        </div>
    `;
}

// Fetch details when the page loads
fetchAndDisplayDetails();