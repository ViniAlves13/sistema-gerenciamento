const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Importa a biblioteca de segurança que acabamos de instalar
const rateLimit = require('express-rate-limit');

// 2. Cria a regra de bloqueio (O Leão de Chácara)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Tempo de castigo: 15 minutos
  max: 15, // Limite de 5 tentativas erradas por IP
  message: { error: 'Muitas tentativas de login fracassadas. Por segurança, tente novamente em 15 minutos.' }
});

// ==========================================
// ROTAS PÚBLICAS
// ==========================================

// 3. Colocamos o "loginLimiter" ANTES de chamar o controller
router.post('/login', loginLimiter, userController.login);
router.post('/register', userController.register);

// ==========================================
// ROTAS PRIVADAS (Requerem Token)
// ==========================================
router.get('/profile', authMiddleware([]), userController.getProfile);
router.put('/profile', authMiddleware([]), userController.updateProfile);

// ==========================================
// ROTAS DE GERENCIAMENTO (Só Super User)
// ==========================================
router.get('/', authMiddleware(['super_user']), userController.getUsers);
router.post('/', authMiddleware(['super_user']), userController.createUser);
router.put('/:id', authMiddleware(['super_user']), userController.updateUser);
router.delete('/:id', authMiddleware(['super_user']), userController.deleteUser);

module.exports = router;