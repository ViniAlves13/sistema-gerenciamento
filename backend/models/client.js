const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String,
    required: false 
  },
  address: {
    type: String,
    required: false
  }
}, { 
  timestamps: true // Cria automaticamente os campos createdAt e updatedAt
});

module.exports = mongoose.model('Client', clientSchema);