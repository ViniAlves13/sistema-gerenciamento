const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

// Buscar todos os clientes
router.get('/', authMiddleware(['super_user', 'adm']), clientController.getClients);

// Criar novo cliente (com as compras e baixa de estoque)
router.post('/', authMiddleware(['super_user', 'adm']), clientController.createClient);

// Atualizar cliente existente
router.put('/:id', authMiddleware(['super_user', 'adm']), clientController.updateClient);

// Deletar cliente
router.delete('/:id', authMiddleware(['super_user', 'adm']), clientController.deleteClient);

module.exports = router;