const User = require('../models/userModel');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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
const updateMe = async (req, res, next) => {
  try {
    //1) Create error if user POST´s password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword',
          400,
          { name: 'wrong_route_for_updating_password' }
        )
      );
    }

    //3)Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    //2) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
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
  updateMe,
  deleteMe,
};
