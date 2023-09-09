const mongoose = require('mongoose');

const rutasSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    maxlength: [
      40,
      'A Company name must have less or equal than 40 characters',
    ],
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
  // startPointCP: {
  //   type: String,
  //   required: true,
  // },
  endPoint: {
    type: String,
    required: true,
  },
  initialDate: {
    type: Date,
    required: true,
    min: new Date(),
  },
  price: {
    type: Number,
    required: true,
    min: [400, 'The min value for a Route is $400'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Ruta = mongoose.model('Ruta', rutasSchema);

module.exports = Ruta;
