require('dotenv').config(); // Só precisa de uma vez no topo
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configurações
app.use(cors());
app.use(express.json());

// Rota de Teste (Para você não ver mais aquele "Cannot GET /")
app.get('/', (req, res) => {
  res.send('🚀 API do GestãoPro rodando com sucesso!');
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Conectado com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/users', require('./routes/userRoutes')); 
app.use('/api/products', require('./routes/productRoutes')); 
app.use('/api/clients', require('./routes/clientRoutes')); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));