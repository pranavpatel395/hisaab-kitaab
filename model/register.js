const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Mongoose Schema
const registerUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique:true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

const RegisterUser = mongoose.model('User', registerUserSchema);

// Joi Validation
function registerValidator(data) {
  const registerUserValidationSchema = Joi.object({
    username: Joi.string()
      .required()
      .trim(),
  
    name: Joi.string()
      .required()
      .trim(),
  
    email: Joi.string()
      .email()
      .required()
      .trim()
      .lowercase(),
  
    password: Joi.string()
      .min(8)
      .required(),
  
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({ 'any.only': 'Passwords do not match' }),
  });
  
  return registerUserValidationSchema.validate(data);
}

module.exports = {
  RegisterUser,
  registerValidator,
};