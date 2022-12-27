const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

const Genres = db.Genre;

const genresAPIController = {
    'list': (req, res) => {
        Genres.findAll()
        .then(genres => {
            let respuesta = {
                meta: {
                    status : 200,
                    total: genres.length,
                    url: 'api/genres'
                },
                data: genres
            }
                res.json(respuesta);
            })
    },
    
    'detail': (req, res) => {
        Genres.findByPk(req.params.id)
            .then(genre => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: genre.length,
                        url: '/api/genre/:id'
                    },
                    data: genre
                }
                res.json(respuesta);
            });
    },
    'genreMovies': (req, res) => {
        Genres.findByPk(req.params.id,{
            include: ['movies']
        })
            .then(genre => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: genre.length,
                        url: '/api/genre/:id/movies'
                    },
                    data: genre
                }
                res.json(respuesta);
            });
    }
}

module.exports = genresAPIController;