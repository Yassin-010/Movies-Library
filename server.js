const express = require('express');
const app = express();
const movieData = require('./Movie Data/data.json');
const PORT = 3000;


// Home Page Endpoint
app.get('/', handleHomePage);

// Favorite Page Endpoint
app.get('/favorite', handleFavoritePage);


// Error handling middlewares
app.use(handleServerError);
app.use(handlePageNotFoundError);


//Functions 
function handleHomePage(req,res){
    let newMovie = new Movie(movieData.title, movieData.poster_path, movieData.overview);
    res.json(newMovie);
}

function handleFavoritePage(req, res) {
    res.send('Welcome to Favorite Page');
  }

// Error handling function for server errors (status 500)
function handleServerError(err, req, res, next) {
    console.error(err);
    res.status(500).json({
      status: 500,
      responseText: 'Sorry, something went wrong'
    });
  }

// Error handling function for "page not found" errors (status 404)
function handlePageNotFoundError(req, res) {
    res.status(404).json({
      status: 404,
      responseText: 'Page not found'
    });
  }

// Constructor function for the data
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
  }
  
// Start the server
app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});