const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");

// Listar todas las películas junto con el reparto
exports.listPeliculas = async (req, res) => {
    try {
        const peliculas = await db.peliculas.findAll({
            include: [
                {
                    model: db.reparto,
                    as: 'reparto',
                    include: [
                        { model: db.personas, as: 'persona' }  // Incluye la persona en el reparto
                    ]
                }
            ]
        });
        res.json(peliculas);
    } catch (error) {
        sendError500(error, res);
    }
}

// Obtener todas las películas donde aparece o dirige una persona por ID
exports.getPeliculasByPersonaId = async (req, res) => {
    const personaId = req.params.personaId;
    try {
        const peliculas = await db.peliculas.findAll({
            include: [
                {
                    model: db.reparto,
                    as: 'reparto',
                    where: { personaId: personaId },
                    include: [
                        {
                            model: db.personas,
                            as: 'persona',
                            attributes: ['nombre', 'apellido']
                        }
                    ]
                }
            ]
        });

        if (peliculas.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron películas para esta persona' });
        }

        res.json(peliculas);
    } catch (error) {
        sendError500(error, res);
    }
};

// Obtener una película por ID junto con su reparto
// En tu controlador de peliculas.js
exports.getPeliculasById = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await db.peliculas.findByPk(id, {
            include: [
                {
                    model: db.reparto,
                    as: 'reparto',
                    include: [
                        {
                            model: db.personas,
                            as: 'persona',
                            attributes: ['nombre', 'apellido']  // Selecciona solo los atributos necesarios
                        }
                    ]
                }
            ]
        });

        if (!pelicula) {
            return res.status(404).json({ msg: 'Película no encontrada' });
        }
        res.json(pelicula);
    } catch (error) {
        sendError500(error);
    }
};


// Crear una película, con la posibilidad de asociar un reparto
exports.createPelicula = async (req, res) => {
    const requiredFields = ['nombre', 'sinopsis', 'fecha_lanzamiento', 'calificacion_rotten_tomatoes'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const pelicula = {
            nombre: req.body.nombre,
            sinopsis: req.body.sinopsis,
            fecha_lanzamiento: req.body.fecha_lanzamiento,
            calificacion_rotten_tomatoes: req.body.calificacion_rotten_tomatoes,
            trailer_youtube: req.body.trailer_youtube
        };

        const peliculaCreada = await db.peliculas.create(pelicula);

        // Si hay datos de reparto en el cuerpo de la solicitud, crearlos
        if (req.body.reparto && req.body.reparto.length > 0) {
            const reparto = req.body.reparto.map(r => ({
                movieId: peliculaCreada.id,
                personaId: r.personaId,
                esDirector: r.esDirector || false
            }));

            await db.reparto.bulkCreate(reparto);  // Crear el reparto asociado a la película
        }

        res.status(201).json({ id: peliculaCreada.id, msg: 'Película creada correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

// Actualizar una película completamente, con la posibilidad de actualizar el reparto
exports.updatePeliculaPut = async (req, res) => {
    const id = req.params.id;
    const requiredFields = ['nombre', 'sinopsis', 'fecha_lanzamiento', 'calificacion_rotten_tomatoes'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }

        // Actualizar la película
        pelicula.nombre = req.body.nombre;
        pelicula.sinopsis = req.body.sinopsis;
        pelicula.fecha_lanzamiento = req.body.fecha_lanzamiento;
        pelicula.calificacion_rotten_tomatoes = req.body.calificacion_rotten_tomatoes;
        pelicula.trailer_youtube = req.body.trailer_youtube;

        await pelicula.save();

        // Si se proporciona reparto, eliminar el existente y crear el nuevo
        if (req.body.reparto && req.body.reparto.length > 0) {
            // Eliminar el reparto existente
            await db.reparto.destroy({ where: { movieId: pelicula.id } });
            
            // Crear el nuevo reparto
            const nuevoReparto = req.body.reparto.map(r => ({
                movieId: pelicula.id,
                personaId: r.personaId,
                esDirector: r.esDirector || false
            }));

            await db.reparto.bulkCreate(nuevoReparto);
        }

        res.json(pelicula);
    } catch (error) {
        sendError500(error, res);
    }
};

// Actualizar una película parcialmente
exports.updatePeliculaPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }

        pelicula.nombre = req.body.nombre || pelicula.nombre;
        pelicula.sinopsis = req.body.sinopsis || pelicula.sinopsis;
        pelicula.fecha_lanzamiento = req.body.fecha_lanzamiento || pelicula.fecha_lanzamiento;
        pelicula.calificacion_rotten_tomatoes = req.body.calificacion_rotten_tomatoes || pelicula.calificacion_rotten_tomatoes;
        pelicula.trailer_youtube = req.body.trailer_youtube || pelicula.trailer_youtube;

        await pelicula.save();

        if (req.body.reparto && req.body.reparto.length > 0) {
            await db.reparto.destroy({ where: { movieId: pelicula.id } });

            const nuevoReparto = req.body.reparto.map(r => ({
                movieId: pelicula.id,
                personaId: r.personaId,
                esDirector: r.esDirector || false
            }));

            await db.reparto.bulkCreate(nuevoReparto);
        }

        res.json(pelicula);
    } catch (error) {
        sendError500(error, res);
    }
};

exports.deletePelicula = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }

        await db.reparto.destroy({ where: { movieId: pelicula.id } });

        await pelicula.destroy();
        res.json({ msg: 'Película eliminada correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

exports.uploadPicture = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res); 
        if (!pelicula) {
            return;
        }

        if (!req.files || !req.files.fotpelicula) { 
            return res.status(400).json({ msg: 'No se ha subido ninguna imagen' });
        }

        const file = req.files.fotpelicula; 
        const fileName = `${pelicula.id}.jpg`;

        file.mv(`public/peliculas/${fileName}`, async (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            pelicula.imagen = fileName;
            await pelicula.save();
            res.json(pelicula);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function getPeliculaOr404(id, res) {
    const pelicula = await db.peliculas.findByPk(id);
    if (!pelicula) {
        res.status(404).json({ msg: 'Película no encontrada' });
        return null;
    }
    return pelicula;
}

function sendError500(error, res) {
    res.status(500).json({ error: error.message });
}
