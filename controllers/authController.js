const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

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
      role: req.body.role,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
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

    //2) check if user exist && password is correct
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

const protect = async (req, res, next) => {
  try {
    let token;
    //1) Getting token and check if it´s there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in, Please login to get access', 401, {
          name: 'Missing_authorization_bearer',
        })
      );
    }

    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist',
          401,
          { name: 'User_token_does_not_exist' }
        )
      );
    }

    //4) check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password!, Please log in again',
          401,
          { name: 'User_changed_password_recently' }
        )
      );
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    next();
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-transportista']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403, {
          name: 'User_dont_have_permission',
        })
      );
    }
    next();
  };
};

const forgotPassword = async (req, res, next) => {
  try {
    //1) Get User based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with that email address', 404, {
          name: 'email_is_not_valid',
        })
      );
    }

    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) Send it to user´s email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n 
    If you didnt forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your new reset token (valid for 10 min) ',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (error) {
      user.createPasswordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again Later',
          500,
          { name: 'Error_sending_email' }
        )
      );
    }
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    //1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    //2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(
        new AppError('Token is invalid or has expired', 400, {
          name: 'token_invalid_or_expired',
        })
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) Update changedPasswordAt property for the user

    //4) Log the user in, send JWT
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

const updatePassword = async (req, res, next) => {
  try {
    //1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //2) Check if posted currect password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(
        new AppError('Your current password is wrong', 401, {
          name: 'Current_password_is_wrong',
        })
      );
    }
    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4) Log user in, send JWT
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
