const Client = require('../models/Client');
const Product = require('../models/Product');

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

// ==========================================
// 🔒 CRIAÇÃO BLINDADA DE CLIENTES
// ==========================================
exports.createClient = async (req, res) => {
  try {
    // 1. Ignoramos totalmente o "totalSpent" e "price" que vieram do frontend!
    const { name, email, phone, cep, address, purchases } = req.body;

    let comprasValidadas = [];
    let totalCalculado = 0;

    // 2. Validação e Recálculo no Servidor
    if (purchases && purchases.length > 0) {
      for (let item of purchases) {
        const qty = parseInt(item.quantity);
        
        // 🔒 Segurança: Bloqueia quantidades nulas ou negativas (hack de aumentar estoque)
        if (isNaN(qty) || qty <= 0) {
          return res.status(400).json({ error: 'Quantidade de produto inválida.' });
        }

        // 🔒 Segurança: Busca o preço ORIGINAL direto do banco de dados
        const produtoReal = await Product.findById(item.productId);
        if (!produtoReal) {
          return res.status(404).json({ error: 'Um dos produtos não existe mais no sistema.' });
        }

        // 🔒 Segurança: Bloqueia se o estoque real for menor que a quantidade pedida
        if (produtoReal.stock < qty) {
          return res.status(400).json({ error: `Estoque insuficiente para o produto: ${produtoReal.name}` });
        }

        const subtotalReal = produtoReal.price * qty;
        totalCalculado += subtotalReal;

        comprasValidadas.push({
          productId: produtoReal._id,
          productName: produtoReal.name,
          quantity: qty,
          price: produtoReal.price, // Usa o preço do banco, não o do React
          subtotal: subtotalReal
        });
      }
    }

    // 3. Salva o cliente com os dados 100% verificados
    const newClient = new Client({ 
      name, email, phone, cep, address, 
      purchases: comprasValidadas, 
      totalSpent: totalCalculado 
    });
    
    await newClient.save();

    // 4. Desconta do estoque com segurança
    for (let item of comprasValidadas) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity } 
      });
    }

    res.status(201).json({ message: 'Cliente registrado com sucesso e segurança!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente', details: error.message });
  }
};

// ==========================================
// 🔒 EDIÇÃO BLINDADA E RECONCILIAÇÃO
// ==========================================
exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, cep, address, purchases } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (purchases) {
      // PASSO A: Devolve os itens antigos para a prateleira
      if (client.purchases && client.purchases.length > 0) {
        for (let oldItem of client.purchases) {
          await Product.findByIdAndUpdate(oldItem.productId, { $inc: { stock: oldItem.quantity } });
        }
      }

      // PASSO B: Valida rigorosamente os itens novos
      let comprasValidadas = [];
      let totalCalculado = 0;

      if (purchases.length > 0) {
        for (let item of purchases) {
          const qty = parseInt(item.quantity);
          if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'Quantidade inválida.' });

          const produtoReal = await Product.findById(item.productId);
          if (!produtoReal) return res.status(404).json({ error: 'Produto não encontrado.' });

          // Verifica se tem estoque suficiente AGORA (depois de já ter devolvido o estoque antigo)
          if (produtoReal.stock < qty) {
            // Se der erro, precisamos cancelar a operação! Mas como já devolvemos o estoque antigo no Passo A, 
            // precisamos reverter a devolução antes de avisar o erro.
            for (let oldItem of client.purchases) {
              await Product.findByIdAndUpdate(oldItem.productId, { $inc: { stock: -oldItem.quantity } });
            }
            return res.status(400).json({ error: `Estoque insuficiente para: ${produtoReal.name}` });
          }

          const subtotalReal = produtoReal.price * qty;
          totalCalculado += subtotalReal;

          comprasValidadas.push({
            productId: produtoReal._id,
            productName: produtoReal.name,
            quantity: qty,
            price: produtoReal.price,
            subtotal: subtotalReal
          });
        }
      }

      // PASSO C: Desconta os itens novos validados da prateleira
      for (let item of comprasValidadas) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
      
      client.purchases = comprasValidadas;
      client.totalSpent = totalCalculado;
    }

    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.cep = cep || client.cep;
    client.address = address || client.address;

    await client.save();
    res.status(200).json({ message: 'Cliente atualizado com segurança máxima!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
  }
};

// ==========================================
// DELETAR CLIENTE (Sem alterações lógicas)
// ==========================================
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    if (client.purchases && client.purchases.length > 0) {
      for (let item of client.purchases) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity } 
        });
      }
    }

    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Cliente deletado e estoque restaurado.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
};