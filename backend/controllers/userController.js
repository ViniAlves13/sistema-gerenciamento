const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
// Registro de usuário público (Força o nível 'usuario_comum')
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verifica se o e-mail já existe no banco
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // 2. Cria o usuário com a trava de segurança no 'role'
    user = new User({
      name,
      email,
      password,
      role: 'usuario_comum' // Ignora o que vier do frontend e força esse nível
    });

    // 3. Criptografa a senha
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Salva no banco
    await user.save();
    
    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};
// Função de Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Acha o usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    // 2. Compara a senha digitada com a senha criptografada do banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    // 3. Se tudo der certo, gera o "Crachá" (Token JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Crachá vale por 1 dia
    );

    // 4. Devolve o token para o React
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Regra de segurança extra: Ninguém pode deletar um super_user
    if (user.role === 'super_user') {
      return res.status(403).json({ error: 'Não é permitido excluir um Super Usuário do sistema.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};