const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");

exports.listReparto = async (req, res) => {
    try {
        const reparto = await db.reparto.findAll({
            include: [
                { model: db.peliculas, as: 'pelicula' },
                { model: db.personas, as: 'persona' }
            ]
        });
        res.json(reparto);
    } catch (error) {
        sendError500(error, res);
    }
}

exports.getRepartoById = async (req, res) => {
    const id = req.params.id;
    try {
        const reparto = await getRepartoOr404(id, res);
        if (!reparto) {
            return;
        }
        res.json(reparto);
    } catch (error) {
        sendError500(error, res);
    }
}

exports.createReparto = async (req, res) => {
    const requiredFields = ['movieId', 'personaId'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const reparto = {
            movieId: req.body.movieId,
            personaId: req.body.personaId,
            esDirector: req.body.esDirector || false,
        };

        const repartoCreado = await db.reparto.create(reparto);
        res.status(201).json({ id: repartoCreado.id, msg: 'Reparto creado correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

exports.updateRepartoPut = async (req, res) => {
    const id = req.params.id;
    const requiredFields = ['movieId', 'personaId'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const reparto = await getRepartoOr404(id, res);
        if (!reparto) {
            return;
        }

        reparto.movieId = req.body.movieId;
        reparto.personaId = req.body.personaId;
        reparto.esDirector = req.body.esDirector;

        await reparto.save();
        res.json(reparto);
    } catch (error) {
        sendError500(error, res);
    }
};

exports.deleteReparto = async (req, res) => {
    const id = req.params.id;
    try {
        const reparto = await getRepartoOr404(id, res);
        if (!reparto) {
            return;
        }

        await reparto.destroy();
        res.json({ msg: 'Reparto eliminado correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

// Función auxiliar para obtener un reparto o devolver un error 404
async function getRepartoOr404(id, res) {
    const reparto = await db.reparto.findByPk(id, {
        include: [
            { model: db.peliculas, as: 'pelicula' },
            { model: db.personas, as: 'persona' }
        ]
    });
    if (!reparto) {
        res.status(404).json({ msg: 'Reparto no encontrado' });
        return null;
    }
    return reparto;
}

// Función para manejar errores 500
function sendError500(error, res) {
    console.error(error);  // Log del error para el servidor
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
}
