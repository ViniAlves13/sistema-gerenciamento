const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas para O PRÓPRIO usuário (qualquer nível de acesso)
router.get('/profile', authMiddleware(['super_user', 'adm', 'usuario_comum']), userController.getProfile);
router.put('/profile', authMiddleware(['super_user', 'adm', 'usuario_comum']), userController.updateProfile);

// Rotas exclusivas do SUPER USER para gerenciar os outros
router.get('/', authMiddleware(['super_user']), userController.getUsers);
router.post('/', authMiddleware(['super_user']), userController.createUser);
router.put('/:id', authMiddleware(['super_user']), userController.updateUser);

module.exports = router;