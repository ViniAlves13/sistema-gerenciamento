const Client = require('../models/client');

// Criar um novo cliente
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const newClient = new Client({ name, email, phone, address });
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o cliente', details: error.message });
  }
};

// Listar todos os clientes
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
};

// Buscar um cliente específico por ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o cliente', details: error.message });
  }
};

// Atualizar um cliente
exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente não encontrado para atualizar' });
    }
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o cliente', details: error.message });
  }
};

// Deletar um cliente
exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ error: 'Cliente não encontrado para deletar' });
    }
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o cliente', details: error.message });
  }
};