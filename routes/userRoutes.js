const express = require('express');
const userRouter = express.Router();
const {
  getAllUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userControllers');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.patch('/updatePassword', protect, updatePassword);

userRouter.patch('/updateME', protect, updateMe);
userRouter.patch('/deleteME', protect, deleteMe);

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
