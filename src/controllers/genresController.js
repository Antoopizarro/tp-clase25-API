const db = require('../database/models');
const sequelize = db.sequelize;


const Genres = db.Genre;

const genresController = {
    'list': (req, res) => {
        Genres.findAll()
            .then(genres => {
                res.render('genresList.ejs', {genres})
            })
    },
    'detail': (req, res) => {
        Genres.findByPk(req.params.id)
            .then(genre => {
                res.render('genresDetail.ejs', {genre});
            });
    }

}

module.exports = genresController;