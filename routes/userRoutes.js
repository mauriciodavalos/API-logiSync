const express = require('express');
const userRouter = express.Router();
const {
  getAllUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
} = require('../controllers/userControllers');
const { signup, login } = require('../controllers/authController');

userRouter.post('/signup', signup);
userRouter.post('/login', login);

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
