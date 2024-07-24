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

async function getMovieById(id, displayDetails = true) {
    if (autorizationFilter(1)) {
        if (id) {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
            const data = await response.json();
            if (displayDetails) {
                displayMovieDetails(data);
            } else {
                return data.results;
            }
        }
    }
}


function displayMovieDetails(movie) {
    const movieDetails = document.getElementById('movieDetails');
    if (movie) {
        const posterPath = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        movieBudget = "";
        if (movie.budget) {
            movieBudget = `<span class=addInfoKey>Budget:</span><span class=addInfoValue>${movie.budget / 1000000} mln.$</span> </br>`;
        }
        let homepage = "";
        if (movie.homepage) {
            homepage = `<span class=addInfoKey>Home page:</span><a href=${movie.homepage} target="_blank" class="homepage_link">${movie.title}</a></br>`
        }
        let rating = "";
        if (movie.homepage) {
            rating = `<span class=addInfoKey>Rating: </span><span class=addInfoValue>${movie.vote_average}</span>`
        }
        let classCheckedimg = "addedCheckUnvisible";        
        if (isFavorite(movie.id)) {
            classCheckedimg = "addedCheckVisible";
        }
    
        movieDetails.innerHTML = `
            <div class=posterDetails>
                <img class="movie-poster-full" src="${posterPath}" alt="${movie.title}">
            </div>
            <div class=descriptionDetails>
                <h3>${movie.title} (${movie.release_date})</h3>
                <p>${movie.overview}</p>
                <div class=addInfo>
                    ${movieBudget}
                    ${homepage}
                    ${rating}
                    <img class="addToFavoriteImg" src="./sources/img/star.png" alt="No image" onClick=setFavorite(${movie.id})>
                    <img class="${classCheckedimg}" id="addedCheckDesc${movie.id}" src="./sources/img/checked.png" alt="No image">
                </div>
                <h5>Your personal description</h5>
                <p id="descriptionFromUser">${getPersonalDescription(movie.id)}</p>
            </div>
            <div class=personalDescriptionConteiner>
                <textarea id="personalDescription">${getPersonalDescription(movie.id)}</textarea>
                <button class="button" id="savePersonalDescription">OK</button>                
            </div>`;
        document.getElementById('savePersonalDescription').addEventListener('click', function() {
            const descr = document.getElementById('personalDescription').value;
            localStorage.setItem(movie.id + "_description", descr);
            document.getElementById('descriptionFromUser').textContent = descr;
        });
    } else {
        movieDetails.innerHTML = '';
    }
    window. scrollTo(0, 0); 
}

function getPersonalDescription(filmId) {
    const descr = localStorage.getItem(filmId + "_description");
    if(!descr) {
        return "";
    }
    return descr;
}

function isFavorite(filmId) {
    return !(localStorage.getItem(filmId + "_favorite") === null);
}


async function fetchMovies(page = 1) {
    const sortList = document.getElementById('sortDropdown');
    let sortBy = "";
    if (sortList) {
        sortBy = sortList.options[sortList.selectedIndex].value; 
    } else {
        sortBy = "popularity.desc";
    }
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&include_video=false&page=${page}&sort_by=${sortBy}`);
    const data = await response.json();
    totalPages = data.total_pages;
    displayMovieList(data.results);
    updatePagination();
    displayMovieDetails();
}

function displayMovieList(movies) {
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = movies.map(movie => {
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '';
    let classCheckedimg = "addedCheckUnvisible";
    if (isFavorite(movie.id)) {
        classCheckedimg = "addedCheckVisible";
    }
    return `<div class="movie-item">
                <div class=poster>
                    <img src="${posterPath}" alt="${movie.title}">
                </div>
                <div class=description>
                    <h3 class="movieListHeader" onClick=getMovieById(${movie.id})>${movie.title}</h3>
                    <p>Release Date: ${movie.release_date}</p>
                    <img class="addToFavoriteImg" src="./sources/img/star.png" alt="No image" onClick=setFavorite(${movie.id})>
                    <img class="${classCheckedimg}" id="addedCheck${movie.id}"  src="./sources/img/checked.png">
                </div>
            </div>`;})
            .join('');

}

async function showFavoriteList() {
    if (!autorizationFilter(1)) {
        return;
    }
    let response = null;
    let data = null;
    movies = [];
    for(let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) {
          continue; 
        }
        if (key.includes("_favorite")) {
            response = await fetch(`https://api.themoviedb.org/3/movie/${localStorage.getItem(key)}?api_key=${API_KEY}`);
            data = await response.json();
            movies.push(data);
        }
    }
    totalPages = 1;
    displayMovieList(movies);    
    updatePagination();
    displayMovieDetails();
}

function setFavorite(filmId) {
    const imgAdded = document.getElementById(`addedCheck${filmId}`);
    const imgAddedDesc = document.getElementById(`addedCheckDesc${filmId}`);
    const isFavor = !isFavorite(filmId);
    invertVisibility(isFavor, imgAdded, filmId);
    if (imgAddedDesc) {
        invertVisibility(isFavor, imgAddedDesc, filmId);
    }
}

function invertVisibility(isVisible, elem, filmId) {
    if (isVisible) {
        localStorage.setItem(filmId + "_favorite", filmId);
        elem.classList.remove("addedCheckUnvisible");
        elem.classList.add("addedCheckVisible");

    } else {
        localStorage.removeItem(filmId + "_favorite");        
        elem.classList.remove("addedCheckVisible");
        elem.classList.add("addedCheckUnvisible");
    }

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
        const sortList = document.getElementById('sortDropdown');
        let sortBy = "";
        if (sortList) {
            sortBy = sortList.options[sortList.selectedIndex].value; 
        } else {
            sortBy = "popularity.desc";
        }
    

        const query = document.getElementById('filterQuery').value;
        const filterList = document.getElementById('filterDropdown');
        let filterBy = "";
        if (filterList) {
            filterBy = filterList.options[filterList.selectedIndex].value; 
        } else {
            filterBy = "popularity.desc";
        }

        if (query) {
            currentPage = 1;
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&${filterBy}=${query}&page=${currentPage}&sort_by=${sortBy}`);
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