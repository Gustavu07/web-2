const express = require('express');
const router = express.Router();
const peliculasController = require('../controllers/peliculasController.js');

router.get('/', peliculasController.listPeliculas);
router.get('/:id', peliculasController.getPeliculasById);
router.post('/', peliculasController.createPelicula);
router.patch('/:id', peliculasController.updatePeliculaPatch);
router.put('/:id', peliculasController.updatePeliculaPut);
router.delete('/:id', peliculasController.deletePelicula);

// Ruta para obtener películas por persona
router.get('/personas/:personaId/peliculas', peliculasController.getPeliculasByPersonaId);
router.post('/:id/upload-picture', peliculasController.uploadPicture);

module.exports = router;
