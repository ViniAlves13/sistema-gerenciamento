const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Qualquer usuário logado pode listar e ver um produto específico
router.get('/', authMiddleware(['super_user', 'adm', 'usuario_comum']), productController.getProducts);
router.get('/:id', authMiddleware(['super_user', 'adm', 'usuario_comum']), productController.getProductById);

// Apenas super_user e adm podem criar, atualizar e deletar produtos
router.post('/', authMiddleware(['super_user', 'adm']), productController.createProduct);
router.put('/:id', authMiddleware(['super_user', 'adm']), productController.updateProduct);
router.delete('/:id', authMiddleware(['super_user', 'adm']), productController.deleteProduct);

module.exports = router;