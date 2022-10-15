const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen otra forma de llamar a cada uno de los modelos



const moviesController = {
    list : async (req, res) => {

        const {limit, order, search} = req.query;
        const fields = ['title', 'rating', 'release_date','length', 'awards']

        try {

            if(order && !fields.includes(order)){
                throw createError(400,`Solo se ordenan los campos por ${fields.join(', ')}`);
            }

            let total = await db.Movie.count();
            let movies = await db.Movie.findAll({
                attributes : {
                    exclude : ['created_at', 'updated_ad']
                },
                include : [
                    {
                        association : 'genre',
                        attributes : {
                            exclude : ['created_at', 'updated_at']
                        }
                    },
                    {
                        association : 'actors',
                        attributes : {
                            exclude : ['created_at', 'updated_at']
                        }
                    }
                ],
                limit : limit ? +limit : 5,
                offset : limit ? +limit : 5,
                order : [order ? order : 'id']
            });

            return res.status(200).json({
                ok :  true,
                meta : {
                    status : 200
                },
                data : {
                    items : movies.length,
                    total,
                    movies
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok : false,
                msg : error.message
            })
        }
    },
    getById : (req, res) => {
        db.Movie.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    newest: (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    recomended: (req, res) => {
        db.Movie.findAll({
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
    //Aqui dispongo las rutas para trabajar con el CRUD

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
    destroy: function (req,res) {
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then(()=>{
            return res.redirect('/movies')})
        .catch(error => res.send(error)) 
    }
}

module.exports = moviesController;