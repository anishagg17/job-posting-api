const express = require('express');
const Recruiter = require('../../models/recruiter');
const User = require('../../models/user');
const Job = require('../../models/job');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const recruiterMiddleware = require('../recruiter/middleware');
const userMiddleware = require('../user/middleware');

//Post a Job [Recruiter]
router.post('/create', recruiterMiddleware, async (req, res) => {
    try {
      const recruiter = await Recruiter.findById(req.recruiter.id).select('-password');

      if(!recruiter)  return res.status(401).json({
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

      if(job.recruiter!=req.recruiter.id)   return res.status(401).json({
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

//Accept a candidate.
router.post('/accept/:id', recruiterMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if(!job)   return res.status(401).json({
      msg: 'Job not found'
    });

    if(job.status=='closed')  return res.status(401).json({
      msg: 'Job already closed'
    });

    if(job.recruiter!=req.recruiter.id)   return res.status(401).json({
      msg: 'You are not the recruiter for this job'
    });

    // console.log(req);
    for(let idx=0;idx<job.applicants.length;idx++){
      if(job.applicants[idx].user==req.body.user){
        if(job.applicants[idx].status!='application submitted'){
          return res.status(401).json({
            msg: "User application is not under consideration"
          });
        }

        job.applicants[idx].status='selected';
        job.status='closed';
        job.save();

        // console.log("u",job.applicants[idx]);
        return res.status(200).json({
          msg: "User accepted for this application"
        });
      }
    }

    res.status(401).json({
      msg: "User didn't apply or deleted his application"
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      msg: 'server error'
    });
  }
});

//Reject a candidate.
router.post('/reject/:id', recruiterMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if(!job)   return res.status(401).json({
      msg: 'Job not found'
    });

    if(job.status=='closed')  return res.status(401).json({
      msg: 'Job already closed'
    });

    if(job.recruiter!=req.recruiter.id)   return res.status(401).json({
      msg: 'You are not the recruiter for this job'
    });

    // console.log(req);
    for(let idx=0;idx<job.applicants.length;idx++){
      if(job.applicants[idx].user==req.body.user){
        if(job.applicants[idx].status!='application submitted'){
          return res.status(401).json({
            msg: "User application is not under consideration"
          });
        }

        job.applicants[idx].status='rejected';
        job.save();

        // console.log("u",job.applicants[idx]);
        return res.status(200).json({
          msg: "User rejected for this application"
        });
      }
    }

    res.status(401).json({
      msg: "User didn't apply or deleted his application"
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      msg: 'server error'
    });
  }
});


module.exports = router;