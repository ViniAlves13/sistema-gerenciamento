const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Oculta a senha na listagem
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Criptografa a senha antes de salvar
    
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};
// Atualizar usuário (Update)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) return res.status(404).json({ error: 'Usuário não encontrado' });

    // REGRA DE SEGURANÇA: Só pode editar um super_user se for ele mesmo
    if (targetUser.role === 'super_user' && req.user.id !== targetUser._id.toString()) {
      return res.status(403).json({ error: 'Acesso negado: Você não pode editar outro super_user' });
    }

    // Atualiza os dados básicos
    targetUser.name = name || targetUser.name;
    targetUser.email = email || targetUser.email;
    if (role) targetUser.role = role;

    // Se uma nova senha foi enviada, criptografa ela também
    if (password) {
      const salt = await bcrypt.genSalt(10);
      targetUser.password = await bcrypt.hash(password, salt);
    }

    await targetUser.save();
    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};
// Atualizar o próprio perfil
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};