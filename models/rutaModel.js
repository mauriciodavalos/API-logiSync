const mongoose = require('mongoose');

const rutasSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['truck', 'car', 'bike', 'van'], // Add or modify vehicle types as needed
  },
  startPoint: {
    type: String,
    required: true,
  },
  endPoint: {
    type: String,
    required: true,
  },
  initialDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Ruta = mongoose.model('Ruta', rutasSchema);

module.exports = Ruta;
