const express = require('express');
const rutaRouter = express.Router();
const {
  getAllRutas,
  createOneRuta,
  getOneRuta,
  updateOneRuta,
  deleteOneRuta,
} = require('../controllers/rutaControllers');

//Param middleware
rutaRouter.param('id', (req, res, next, val) => {
  console.log(`Ruta Id is ${val}`);
  next();
});

rutaRouter
  .route('/')
  .get(getAllRutas)
  .post(createOneRuta);

rutaRouter
  .route('/:id')
  .get(getOneRuta)
  .patch(updateOneRuta)
  .delete(deleteOneRuta);

module.exports = rutaRouter;
