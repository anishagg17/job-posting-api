const express = require('express');
const Recruiter = require('../../models/Recruiter');
const User = require('../../models/User');
const Job = require('../../models/Job');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const recruiterMiddleware = require('../recruiter/middleware');
const userMiddleware = require('../user/middleware');

//Post a Job [Recruiter]
router.post('/create', recruiterMiddleware, async (req, res) => {
    try {
      const recruiter = await Recruiter.findById(req.recruiter.id).select('-password');

      if(!recruiter)  res.status(401).json({
        msg: 'recruiter not logged in'
      });

      const newJob = new Job({
        title: req.body.title,
        company: req.body.company,
        recruiter: req.recruiter.id
      });
  
    //   console.log(newJob);
      const job = await newJob.save();
      res.json(job);  
    } catch (err) {
      console.error(err);
      res.status(401).json({
        msg: 'server error'
      });
    }
});

//List candidates who applied to a job [Recruiter]
router.get('/:id', recruiterMiddleware, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if(job.recruiter!=req.recruiter.id)   res.status(401).json({
        msg: 'you are not the recruiter for this job'
      });

      res.json(job.applicants);  
    } catch (err) {
      console.error(err);
      res.status(401).json({
        msg: 'server error'
      });
    }
});

//Get All Jobs [Recruiter, User]
router.get('/', async (req, res) => {
    try {
      const jobs = await Job.find({status:'open'}).sort({ datePosted: -1 });
      res.json(jobs);
    } catch (err) {
      console.error(err);
      res.status(401).json({
        msg: 'server error'
      });
    }
});


module.exports = router;