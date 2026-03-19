require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); 

const resetarSenhaAdmin = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao banco de dados...');

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash('admin123', salt);
    const adminAtualizado = await User.findOneAndUpdate(
      { email: 'admin@sistema.com' }, 
      { password: senhaCriptografada },
      { new: true }
    );

    if (adminAtualizado) {
      console.log('✅ Sucesso! A senha voltou a ser: admin123');
    } else {
      console.log('❌ Admin não encontrado. Tente rodar: node seed.js');
    }

    process.exit(); 
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
};

resetarSenhaAdmin();