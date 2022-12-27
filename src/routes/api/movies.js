const express = require('express');
const router = express.Router();
const { list, detail, recomended, create, update, destroy } = require('../../controllers/api/moviesAPIController');

router
    .get('/', list)
    .get('/:id', detail)
    .get('/recomended/:rating', recomended)
    .post('/create', create)
    .put('/update/:id', update)
    .delete('/delete/:id', destroy);

module.exports = router;