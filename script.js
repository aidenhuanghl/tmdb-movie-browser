// script.js
const moviesGrid = document.getElementById('movies-grid');
// const loadingIndicator = document.querySelector('.loading'); // Using innerHTML instead
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const pageInfo = document.getElementById('page-info');

const ourApiBaseUrl = '/api/getMovies'; // Our Serverless Function endpoint
const baseImageUrl = 'https://image.tmdb.org/t/p/';
const posterSize = 'w342';

let currentPage = 1;
let totalPages = 1; // Will be updated from API response

async function fetchAndDisplayMovies(page = 1) {
    moviesGrid.innerHTML = '<p class="loading">正在加载电影...</p>'; // Show loading message
    prevButton.disabled = true; // Disable buttons during fetch
    nextButton.disabled = true;
    pageInfo.textContent = '加载中...'; // Update page info

    try {
        // Call our Serverless Function with the page parameter
        const response = await fetch(`${ourApiBaseUrl}?page=${page}`);

        if (!response.ok) {
            let errorMsg = `HTTP 错误! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || errorMsg;
            } catch (e) { /* Ignore if response is not JSON */ }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        totalPages = data.total_pages || 1; // Get total pages from TMDb response
        currentPage = data.page || 1; // Get current page from TMDb response

        displayMovies(data.results); // Display the fetched movies
        updatePaginationControls(); // Update button states and page info

    } catch (error) {
        console.error(`加载第 ${page} 页电影时出错:`, error);
        moviesGrid.innerHTML = `<p class="error">加载电影失败: ${error.message}</p>`;
        pageInfo.textContent = '加载失败';
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = ''; // Clear previous content or loading message

    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p>没有找到热门电影。</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Create link to detail page
        const link = document.createElement('a');
        link.href = `detail.html?id=${movie.id}`; // Link with movie ID

        const posterUrl = movie.poster_path
            ? `${baseImageUrl}${posterSize}${movie.poster_path}`
            : 'https://via.placeholder.com/342x513.png?text=No+Image'; // Placeholder if no image

        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title} 海报" loading="lazy"> <!-- Added lazy loading -->
            <h3>${movie.title}</h3>
            <span class="rating">评分: ${rating}</span>
        `;

        link.appendChild(movieCard); // Wrap card in link
        moviesGrid.appendChild(link); // Add link (containing card) to grid
    });
}

function updatePaginationControls() {
    pageInfo.textContent = `页码: ${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchAndDisplayMovies(currentPage - 1);
    }
});

nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchAndDisplayMovies(currentPage + 1);
    }
});

// Initial load - fetch page 1 when the script runs
fetchAndDisplayMovies(1);