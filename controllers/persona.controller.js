const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");

exports.listPersonas = async (req, res) => {
    try {
        const personas = await db.personas.findAll();
        res.json(personas);
    } catch (error) {
        sendError500(error, res);
    }
}

exports.getPersonaById = async (req, res) => {
    const id = req.params.id;
    try {
        const persona = await getPersonaOr404(id, res);
        if (!persona) {
            return;
        }

        // Construir la URL completa de la imagen
        const personaConImagenUrl = {
            ...persona.toJSON(),
            imagen_url: `/public/personas/${persona.imagen}`
        };

        res.json(personaConImagenUrl);
    } catch (error) {
        sendError500(error, res);
    }
};


exports.createPersona = async (req, res) => {
    const requiredFields = ['nombre', 'apellido'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const persona = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            fechaNacimiento: req.body.fechaNacimiento,
            lugarNacimiento: req.body.lugarNacimiento,
        };

        const personaCreada = await db.personas.create(persona);
        res.status(201).json({ id: personaCreada.id, msg: 'Persona creada correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

exports.updatePersonaPut = async (req, res) => {
    const id = req.params.id;
    const requiredFields = ['nombre', 'apellido'];

    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }

    try {
        const persona = await getPersonaOr404(id, res);
        if (!persona) {
            return;
        }

        persona.nombre = req.body.nombre;
        persona.apellido = req.body.apellido;
        persona.fechaNacimiento = req.body.fechaNacimiento || persona.fechaNacimiento;
        persona.lugarNacimiento = req.body.lugarNacimiento || persona.lugarNacimiento;

        await persona.save();
        res.json(persona);
    } catch (error) {
        sendError500(error, res);
    }
};

exports.updatePersonaPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const persona = await getPersonaOr404(id, res);
        if (!persona) {
            return;
        }

        persona.nombre = req.body.nombre || persona.nombre;
        persona.apellido = req.body.apellido || persona.apellido;
        persona.fechaNacimiento = req.body.fechaNacimiento || persona.fechaNacimiento;
        persona.lugarNacimiento = req.body.lugarNacimiento || persona.lugarNacimiento;

        await persona.save();
        res.json(persona);
    } catch (error) {
        sendError500(error, res);
    }
};

exports.deletePersona = async (req, res) => {
    const id = req.params.id;
    try {
        const persona = await getPersonaOr404(id, res);
        if (!persona) {
            return;
        }

        await persona.destroy();
        res.json({ msg: 'Persona eliminada correctamente' });
    } catch (error) {
        sendError500(error, res);
    }
};

// Subir una imagen para la persona
exports.uploadPicturePersona = async (req, res) => {
    const id = req.params.id;
    try {
        const persona = await db.personas.findByPk(id);
        if (!persona) {
            return res.status(404).json({ msg: 'Persona no encontrada' });
        }

        if (!req.files || !req.files.fotpersona) {
            return res.status(400).json({ msg: 'No se ha subido ninguna imagen' });
        }

        const file = req.files.fotpersona;
        const fileName = `${persona.id}.jpg`;

        file.mv(`public/personas/${fileName}`, async (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            persona.imagen = fileName;
            await persona.save();
            res.json(persona);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Funciones auxiliares
async function getPersonaOr404(id, res) {
    const persona = await db.personas.findByPk(id);
    if (!persona) {
        res.status(404).json({ msg: 'Persona no encontrada' });
        return null;
    }
    return persona;
}

// Función para manejar errores 500
function sendError500(error, res) {
    const errorMsg = error.message || 'Error interno del servidor';
    console.error(error);
    res.status(500).json({ error: errorMsg });
}
