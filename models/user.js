const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
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
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'job', 
  }],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
