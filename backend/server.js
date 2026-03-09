const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Conectado com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes')); // Login
app.use('/api/users', require('./routes/userRoutes')); // CRUD de Usuários
app.use('/api/products', require('./routes/productRoutes')); // CRUD de Produtos
app.use('/api/clients', require('./routes/clientRoutes')); // CRUD de Clientes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));