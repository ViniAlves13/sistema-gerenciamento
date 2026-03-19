const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', authMiddleware(['super_user', 'adm', 'user']), clientController.getClients);


router.post('/', authMiddleware(['super_user', 'adm']), clientController.createClient);


router.put('/:id', authMiddleware(['super_user', 'adm']), clientController.updateClient);


router.delete('/:id', authMiddleware(['super_user', 'adm']), clientController.deleteClient);

module.exports = router;