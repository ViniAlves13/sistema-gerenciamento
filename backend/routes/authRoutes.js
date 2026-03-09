const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login
router.post('/login', authController.login);

module.exports = router; // É a falta dessa linha (ou do arquivo todo) que causa o seu erro!
