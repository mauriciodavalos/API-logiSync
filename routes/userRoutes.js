const express = require('express');
const userRouter = express.Router();
const {
  getAllUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
} = require('../controllers/userControllers');

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getOneUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = userRouter;
