const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      company: req.body.company,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //1) check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    //2) check ig user exist && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    //3) If evertyhing ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

module.exports = { signup, login };
