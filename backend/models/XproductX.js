const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 // Impede que o preço seja negativo
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0 // Impede estoque negativo
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);