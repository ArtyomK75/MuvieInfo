const API_KEY = 'edbdbe4f06748ae2621cd449884a859c';

const PHRASES = new Map();
PHRASES.set(1, "To view detailed information about the film you need to log in");
PHRASES.set(2, "To search for a movie you need to log in");
PHRASES.set(3, "To filter films you need to log in");


let currentPage = 1;
let totalPages = 1;
let currentUser = null;

async function searchMovie() {
    if (autorizationFilter(2)) {
        const query = document.getElementById('movieQuery').value;
        if (query) {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
            const data = await response.json();
            displayMovieDetails(data.results[0]);
        }
    }
}

async function getMovieById(id) {
    if (autorizationFilter(1)) {
        if (id) {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
            const data = await response.json();
            displayMovieDetails(data);
            
        }
    }
}


function displayMovieDetails(movie) {
    const movieDetails = document.getElementById('movieDetails');
    if (movie) {
        const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieDetails.innerHTML = `
            <div class=posterDetails>
                <img class="movie-poster" src="${posterPath}" alt="${movie.title}">
            </div>
            <div class=discriptionDetails>
                <h3>${movie.title} (${movie.release_date})</h3>
                <p>${movie.overview}</p>
                <h5>Your personal discription</h5>
                <p id="discriptionFromUser">${getPersonalDiscription(movie.id)}</p>
            </div>
            <div class=personalDiscriptionConteiner>
                <textarea id="personalDiscription">${getPersonalDiscription(movie.id)}</textarea>
                <button class="button" id="savePersonalDiscription">OK</button>                
            </div>`;
        
        document.getElementById('savePersonalDiscription').addEventListener('click', function() {
            const descr = document.getElementById('personalDiscription').value;
            localStorage.setItem(movie.id, descr);
            document.getElementById('discriptionFromUser').textContent = descr;
        });
    } else {
        movieDetails.innerHTML = '<p>No results found.</p>';
    }
    window. scrollTo(0, 0); 
}

function getPersonalDiscription(filmId) {
    const descr = localStorage.getItem(filmId);
    if(descr === null) {
        return "";
    }
    return descr;
}


async function fetchMovies(page = 1) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`);
    const data = await response.json();
    totalPages = data.total_pages;
    displayMovieList(data.results);
    updatePagination();
}

function displayMovieList(movies) {
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = movies.map(movie => {
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '';
    return `<div class="movie-item">
                <div class=poster>
                    <img src="${posterPath}" alt="${movie.title}">
                </div>
                <div class=description>
                  <h3 class="movieListHeader" onClick=getMovieById(${movie.id})>${movie.title}</h3>
                  <p>Release Date: ${movie.release_date}</p>
                </div>
                </div>`;})
            .join('');
}


function updatePagination() {
    document.getElementById('currentPage').innerText = currentPage;
}

function changePage(direction) {
    if (currentPage + direction > 0 && currentPage + direction <= totalPages) {
        currentPage += direction;
        fetchMovies(currentPage);
    }
}

async function filterMovies() {
    if (autorizationFilter(3)) {
        const query = document.getElementById('filterQuery').value;
        if (query) {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${currentPage}`);
            const data = await response.json();
            displayMovieList(data.results);
            totalPages = data.total_pages;
            updatePagination();
        }
    }
}

function autorizationFilter(typeOfEvent) {
    if (!isAutorized()) {
        if (confirm(PHRASES.get(typeOfEvent))) {
            const authModal = document.getElementById('authModal');
            authModal.style.display = 'flex';
        };
        return false;
    };
    return true;
}

function isAutorized() {
    currentUser = getCookie("user");
    if (currentUser!== null) {
        document.getElementById('userNameDecoration').textContent = currentUser;
        return true;
    }
    return false;
}

function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}


document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');

    closeModal.addEventListener('click', function() {
        authModal.style.display = 'none';
    });

    isAutorized();

    document.getElementById('okAuthButton').addEventListener('click', () => { authByName(); });
    document.getElementById('cancelAuthButton').addEventListener('click', () => {authByName(true);});

    function authByName(isCancel) {
        const username = document.getElementById('username').value;
        const usernameError = document.getElementById('usernameError');

        if (isCancel) {
            authModal.style.display = 'none';
            return;
        }
        if (!(username.length < 4 
            || username.length > 20
            || /[._\/\\|,]/.test(username))) {
                authModal.style.display = 'none';
                document.cookie = `user=${encodeURIComponent(username)};`;
                usernameError.value = "";
                isAutorized();
        } else {
            usernameError.innerText = "The login must be from 4 to 20 characters and not contain symbols . _ / \\ |";
        }
    };
});


fetchMovies();