const express = require('express');
const router = express.Router();
const { list, newest, recomended, detail, add, create, edit, update, remove, destroy , search} = require('../controllers/moviesController');

router
    .get('/movies', list)
    .get('/movies/new', newest)
    .get('/movies/recommended', recomended)
    .get('/movies/detail/:id', detail)
    .get('/movies/add', add)
    .post('/movies/create', create)
    .get('/movies/edit/:id', edit)
    .put('/movies/update/:id', update)
    .get('/movies/delete/:id', remove)
    .delete('/movies/delete/:id', destroy)
    .get('/movies/buscar', search);


module.exports = router;