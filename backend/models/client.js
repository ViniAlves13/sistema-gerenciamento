const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  cep: { type: String }, 
  address: { type: String },
  
  purchases: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalSpent: { type: Number, default: 0 } 
});

module.exports = mongoose.model('Client', clientSchema);