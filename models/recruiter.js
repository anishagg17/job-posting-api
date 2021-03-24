const mongoose = require('mongoose');
const validator = require('validator');

const RecruiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'not an email'
    }
  },
  password: {
    type: String,
    required: true
  }
});

const Recruiter = mongoose.model('recruiter', RecruiterSchema);
module.exports =  Recruiter;