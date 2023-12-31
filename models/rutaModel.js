const mongoose = require('mongoose');

const rutasSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
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
    //GeoJSON
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [Number],
    address: String,
    description: String,
  },
  endPoint: {
    //GeoJSON
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [Number],
    address: String,
    description: String,
  },
  initialDate: {
    type: Date,
    required: true,
    min: [new Date(), 'Please provide a Valid Date'],
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
