const express = require('express');
const router = express.Router();
const {list, newest, recomended, getById, create, update, destroy} = require('../controllers/moviesController');

/* /movies */ 

router
    .get('/', list)
    .get('/new', newest)
    .get('/recommended', recomended)
    .get('/:id', getById)
//Rutas exigidas par la creación del CRUD
    .post('/', create)
    .put('/:id', update)
    .delete('/:id', destroy)

module.exports = router;