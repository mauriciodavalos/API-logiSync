const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name'] },
  company: {
    type: String,
    required: [true, 'Please tell us your company name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on CREATE and SAVE //user.save()
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password is not the same',
    },
  },
});

//Encryption of Passwords
userSchema.pre('save', async function(next) {
  //Only run this function if password was actually mofigied
  if (!this.isModified('password')) return next();

  //hashing with bcrypt, with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete password confirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
