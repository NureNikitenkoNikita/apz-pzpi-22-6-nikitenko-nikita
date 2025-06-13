const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');

router.get('/', disasterController.getAllDisasters);
router.get('/:id/similar', disasterController.getSimilarDisasters);

module.exports = router;