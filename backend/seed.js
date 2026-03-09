const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

const createRootUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Conectado ao MongoDB para Seed');

    // Verifica se já existe o admin para não duplicar
    const userExists = await User.findOne({ email: 'admin@sistema.com' });
    if (userExists) {
      console.log('⚠️ Super User já existe!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const superUser = new User({
      name: 'Administrador Mestre',
      email: 'admin@sistema.com',
      password: hashedPassword,
      role: 'super_user'
    });

    await superUser.save();
    console.log('✅ Super User criado com sucesso! E-mail: admin@sistema.com | Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

createRootUser();