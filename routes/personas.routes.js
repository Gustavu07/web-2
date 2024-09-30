const express = require("express");
const personasController = require("../controllers/persona.controller.js");

const router = express.Router();

router.get("/", personasController.listPersonas);
router.get("/:id", personasController.getPersonaById);
router.post("/", personasController.createPersona);
router.patch("/:id", personasController.updatePersonaPatch);
router.put("/:id", personasController.updatePersonaPut);
router.delete("/:id", personasController.deletePersona);
router.post("/:id/upload-picture", personasController.uploadPicturePersona);

module.exports = router;
