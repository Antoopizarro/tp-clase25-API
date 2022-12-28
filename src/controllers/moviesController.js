const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const fetch = require('fetch');



const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;
const API = 'http://www.omdbapi.com/?apikey=d4e35e92';

const moviesController = {
    'list': (req, res) => {
        Movies.findAll({
            include: ['genre']
        })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        Movies.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'newest': (req, res) => {
        Movies.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        Movies.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    
    'search': async (req, res) => {
        const {titulo}= req.query
        const urlBase='https://www.omdbapi.com/';
        const apikey= process.env.OMDB_APY_KEY
        try {
            let response = await fetch(`${urlBase}?&apikey=${apikey}&t=${titulo}`)
            let movie = await response.json() 

            const{Title,Release, imdbRating, Awards, Runtime}=movie
            const movieDB = await Movies.findOne({
                where: {
                    title: Title
                }
            })

            if(movieDB){
                return res.redirect('/movies/detail/'+movieDB.id)
            }else{

            let newMovie= await Movies.create({
                title: Title,
                rating: +imdbRating,
                awards: Awards.split(' ').filter(letter => !isNaN(letter)).reduce((accumulator, number)=> +accumulator + +number),
                release_date: moment(Release),
                length: parseInt(Runtime),
                genre_id: null
            })
            console.log(newMovie);
            res.redirect('/movies/detail/'+newMovie.id)
        }

        } catch (error) {
            console.log(error);
        }
    },
    
    add: function (req, res) {
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        
        Promise
        .all([promGenres, promActors])
        .then(([allGenres, allActors]) => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesAdd'), {allGenres,allActors})})
        .catch(error => res.send(error))
    },
    create: function (req,res) {
        Movies
        .create(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            }
        )
        .then(()=> {
            return res.redirect('/movies')})            
        .catch(error => res.send(error))
    },
    edit: function(req,res) {
        let movieId = req.params.id;
        let promMovies = Movies.findByPk(movieId,{include: ['genre','actors']});
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        Promise
        .all([promMovies, promGenres, promActors])
        .then(([Movie, allGenres, allActors]) => {
            Movie.release_date = moment(Movie.release_date).format('L');
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesEdit'), {Movie,allGenres,allActors})})
        .catch(error => res.send(error))
    },
    update: function (req,res) {
        let movieId = req.params.id;
        Movies
        .update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: {id: movieId}
            })
        .then(()=> {
            return res.redirect('/movies')})            
        .catch(error => res.send(error))
    },
    remove: function (req,res) {
        let movieId = req.params.id;
        Movies
        .findByPk(movieId)
        .then(Movie => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesDelete'), {Movie})})
        .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true})
        .then(()=>{
            return res.redirect('/movies')})
        .catch(error => res.send(error)) 
    }
}

module.exports = moviesController;