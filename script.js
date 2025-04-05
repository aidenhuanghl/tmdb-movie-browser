// script.js
const moviesGrid = document.getElementById('movies-grid');
const paginationControls = document.querySelector('.pagination');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const pageInfo = document.getElementById('page-info');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const initialMessage = document.querySelector('.info-message');
const loadingIndicator = document.querySelector('.loading'); // Use this if you prefer a dedicated loading element

const popularMoviesApiUrl = '/api/getMovies';
const searchMoviesApiUrl = '/api/searchMovies';
const baseImageUrl = 'https://image.tmdb.org/t/p/';
const posterSize = 'w342';

let currentPage = 1;
let totalPages = 1;
let currentSearchQuery = ''; // Store the active search query
let currentMode = 'popular'; // Track 'popular' or 'search' mode

// Generic function to fetch and display movies based on mode
async function fetchAndDisplayMovies(mode = 'popular', query = '', page = 1) {
    // Show loading state
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (initialMessage) initialMessage.style.display = 'none';
    moviesGrid.innerHTML = ''; // Clear grid
    paginationControls.style.display = 'none'; // Hide pagination initially
    prevButton.disabled = true;
    nextButton.disabled = true;

    let apiUrl = '';
    currentMode = mode; // Set current mode

    if (mode === 'search' && query) {
        apiUrl = `${searchMoviesApiUrl}?query=${encodeURIComponent(query)}&page=${page}`;
        currentSearchQuery = query; // Store query for pagination
    } else {
        // Default to popular movies
        apiUrl = `${popularMoviesApiUrl}?page=${page}`;
        currentSearchQuery = '';
        currentMode = 'popular'; // Ensure mode is set back if query is empty
    }

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMsg = `HTTP 错误! 状态码: ${response.status}`;
            try { const errorData = await response.json(); errorMsg = errorData.error || errorData.message || errorMsg; } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();
        totalPages = data.total_pages || 1;
        currentPage = data.page || 1;

        displayMovies(data.results); // Display the results

        // Show pagination only if there are results and more than one page
        if (data.results && data.results.length > 0 && totalPages > 1) {
            paginationControls.style.display = 'block';
            updatePaginationControls();
        } else {
             paginationControls.style.display = 'none';
        }

    } catch (error) {
        console.error(`加载电影时出错 (Mode: ${mode}, Query: ${query}, Page: ${page}):`, error);
        moviesGrid.innerHTML = `<p class="error">加载电影失败: ${error.message}</p>`;
        pageInfo.textContent = '加载失败';
        paginationControls.style.display = 'none'; // Hide pagination on error
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// Function to display movies (remains largely the same)
function displayMovies(movies) {
    moviesGrid.innerHTML = ''; // Clear grid before adding new movies

    if (!movies || movies.length === 0) {
        // Show message depending on mode
        const message = currentMode === 'search' ? '没有找到符合条件的电影。' : '未能加载热门电影。';
        moviesGrid.innerHTML = `<p class="info-message">${message}</p>`;
        return;
    }

     movies.forEach(movie => {
         const movieCard = document.createElement('div');
         movieCard.classList.add('movie-card');
         const link = document.createElement('a');
         link.href = `detail.html?id=${movie.id}`;
         const posterUrl = movie.poster_path ? `${baseImageUrl}${posterSize}${movie.poster_path}` : 'https://via.placeholder.com/342x513.png?text=No+Image';
         const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
         movieCard.innerHTML = `
             <img src="${posterUrl}" alt="${movie.title} 海报" loading="lazy">
             <h3>${movie.title}</h3>
             <span class="rating">评分: ${rating}</span>
         `;
         link.appendChild(movieCard);
         moviesGrid.appendChild(link);
    });
}

// Function to update pagination controls (remains the same)
function updatePaginationControls() {
    pageInfo.textContent = `页码: ${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

// Event listeners for pagination buttons (updated to use currentMode/Query)
prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchAndDisplayMovies(currentMode, currentSearchQuery, currentPage - 1);
    }
});

nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchAndDisplayMovies(currentMode, currentSearchQuery, currentPage + 1);
    }
});

// Event listener for the search form
searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        fetchAndDisplayMovies('search', searchTerm, 1); // Start search from page 1
    } else {
        // Optional: If search is empty, load popular movies again
        fetchAndDisplayMovies('popular', '', 1);
    }
});

// Initial Load: Fetch popular movies on page load
fetchAndDisplayMovies('popular', '', 1);