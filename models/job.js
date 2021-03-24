const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  recruiter: {
    type: Schema.Types.ObjectId,
    ref: 'recruiter'
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  status :{
    type: String,
    enum : ['open','closed'],
    default: 'open'
  },
  applicants: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      status: {
        type: String,
        enum : ['selected','application submitted','rejected','deleted'],
        default: 'application submitted'
      }
    }
  ],
  datePosted: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('job', JobSchema);
module.exports = Job;
