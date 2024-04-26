const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();
const movieData = require('./Movie Data/data.json');
const pg = require('pg');
app.use(express.json());
const client = new pg.Client(`postgresql://localhost:5432/movie_library_db`);


const PORT = 3000;

// Home Page Endpoint
app.get('/', handleHomePage);

// Favorite Page Endpoint
app.get('/favorite', handleFavoritePage);

// Trending Page Endpoint
app.get('/trending', handleTrendingPage);


// Search Page Endpoint
app.get('/search', handleSearchPage);

// Top Rated Page Endpoint
app.get('/topRated', handleTopRatedPage)

// now-playign page Endpoint
app.get('/now-playing', handleNowPlayingPage);

// Add movie 
app.post('/addMovie', handelAddMoviePage);

// Get All Movies 
app.get('/getMovies', handelGetAllMoviesPage);

// Error handling middlewares
app.use(handleServerError);
app.use(handlePageNotFoundError);

// Functions
function handleHomePage(req, res) {
    let newMovie = new Movie(
        movieData.id,
        movieData.title,
        movieData.release_date,
        movieData.poster_path,
        movieData.overview
    );
    res.json(newMovie);
}

function handleFavoritePage(req, res) {
    res.send('Welcome to Favorite Page');
}

function handleTrendingPage(req, res) {
    axios
        .get(`https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.API_KEY}`)
        .then((response) => {
            const trendingMovies = response.data.results.map((movieData) => {
                return new Movie(
                    movieData.id,
                    movieData.title,
                    movieData.release_date,
                    movieData.poster_path,
                    movieData.overview
                );
            });
            res.json(trendingMovies);
        })
        .catch(err => {
            handleServerError(err);
        });
};


function handleSearchPage(req, res) {
    const query = req.query.name;
    axios
        .get(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${query}&page=2`
        )
        .then(result => {
            res.json(result.data.results)
        })
        .catch(err => {
            handleServerError(err);
        });
}

function handleTopRatedPage(req, res) {
    axios
        .get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}`)
        .then(result => {
            const TopRatedmovies = result.data.results.map((movieData) => {
                return new Movie(
                    movieData.id,
                    movieData.title,
                    movieData.release_date,
                    movieData.poster_path,
                    movieData.overview
                );
            });
            res.json(TopRatedmovies);
        })
        .catch(err => {
            handleServerError(err);
        });
}

function handleNowPlayingPage(req, res) {
    axios
        .get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.API_KEY}`)
        .then((result) => {
            const nowPlayingMovies = result.data.results.map((movieData) => {
                return new Movie(
                    movieData.id,
                    movieData.title,
                    movieData.release_date,
                    movieData.poster_path,
                    movieData.overview
                );
            });
            res.json(nowPlayingMovies);
        })
        .catch(err => {
            handleServerError(err);
        });
};


function handelAddMoviePage(req, res) {
    const { id, title, release_date, poster_path, overview } = req.body;

    // Insert the movie into the database
    const query = 'INSERT INTO movies (id, title, release_date, poster_path, overview) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [id, title, release_date, poster_path, overview];

    client
        .query(query, values)
        .then(() => {
            res.status(200).json({ message: 'Movie added successfully' });
        })
        .catch((error) => {
            handleServerError(error);
        });
};

function handelGetAllMoviesPage(req, res) {
    const query = 'SELECT * FROM movies';
    client
        .query(query)
        .then((result) => {
            const movies = result.rows;
            res.status(200).json({ movies });
        })
        .catch(err => {
            handleServerError(err);
        })
};

// Error handling function for server errors (status 500)
function handleServerError(err, req, res, next) {
    console.error(err);
    res.status(500).json({
        status: 500,
        responseText: 'Sorry, something went wrong',
    });
}

// Error handling function for "page not found" errors (status 404)
function handlePageNotFoundError(req, res) {
    res.status(404).json({
        status: 404,
        responseText: 'Page not found',
    });
}

// Constructor function for the data
function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

// Start the server
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log('Server is running on port 3000');
        });
    })