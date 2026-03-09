const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário logado pode listar e ver clientes
router.get('/', authMiddleware(['super_user', 'adm', 'usuario_comum']), clientController.getClients);
router.get('/:id', authMiddleware(['super_user', 'adm', 'usuario_comum']), clientController.getClientById);

// Apenas super_user e adm podem criar, atualizar e deletar clientes
router.post('/', authMiddleware(['super_user', 'adm']), clientController.createClient);
router.put('/:id', authMiddleware(['super_user', 'adm']), clientController.updateClient);
router.delete('/:id', authMiddleware(['super_user', 'adm']), clientController.deleteClient);

module.exports = router;