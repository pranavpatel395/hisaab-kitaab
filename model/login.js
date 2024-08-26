const mongoose = require('mongoose');
const Joi = require('joi');

const loginUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  }
});


function loginValidator(data){
  const loginUserValidationSchema = Joi.object({
    username: Joi.string()
      .required()
      .trim(),
  
    password: Joi.string()
      .required(),
  });

  let error  = loginUserValidationSchema.model(data)
  return error;

}

module.exports.loginUserSchema = mongoose.model('User', loginUserSchema);
module.exports.loginValidator = loginValidator;
