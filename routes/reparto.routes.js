const express = require('express');
const router = express.Router();
const repartoController = require('../controllers/reparto.controller');

router.get('/', repartoController.listReparto);
router.get('/:id', repartoController.getRepartoById);
router.post('/', repartoController.createReparto);
router.put('/:id', repartoController.updateRepartoPut);
router.delete('/:id', repartoController.deleteReparto);

module.exports = router;
