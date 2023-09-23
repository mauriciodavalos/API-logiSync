const express = require('express');
const rutaRouter = express.Router();
const {
  getAllRutas,
  createOneRuta,
  getOneRuta,
  updateOneRuta,
  deleteOneRuta,
  getRutaStats,
  getAllRutasVigentes,
} = require('../controllers/rutaControllers');
const { protect, restrictTo } = require('../controllers/authController');

//Param middleware
rutaRouter.param('id', (req, res, next, val) => {
  console.log(`Ruta Id is ${val}`);
  next();
});

rutaRouter
  .route('/')
  .get(protect, restrictTo('admin', 'lead-transportista'), getAllRutas)
  .post(protect, restrictTo('admin', 'lead-transportista'), createOneRuta);

rutaRouter.route('/ruta-stats').get(getRutaStats);
rutaRouter.route('/rutas-vigentes').get(getAllRutasVigentes);

rutaRouter
  .route('/:id')
  .get(getOneRuta)
  .patch(updateOneRuta)
  .delete(deleteOneRuta);

module.exports = rutaRouter;
