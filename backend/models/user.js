const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_user', 'adm', 'usuario_comum'], 
    default: 'usuario_comum' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);