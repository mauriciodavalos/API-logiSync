const User = require('../models/userModel');
const AppError = require('../utils/appError');

//2) Handlers - Controllers
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    //Send response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const getOneUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not yet defined',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not yet defined',
  });
};

module.exports = {
  getAllUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
};
