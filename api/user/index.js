const express = require('express');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const middleware = require('./middleware');

//Get currently authenticated User
router.get('/', middleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({
      msg: 'error in user-auth api'
    });
  }
});

//Register a User
router.post('/signUp', async (req, res) => {
//   console.log(req.body);
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const newUser = { ...req.body, password };
    const result = await User.create(newUser);

    jwt.sign(
      {
        user: {
          id: result._id
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600000 },
      (err, token) => {
        if (err) throw err;
        console.log(token);
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(400).end(err.errmsg);
  }
});

//Authenticate User
router.post('/logIn', async (req, res) => {
  // console.log("auth rec");
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errmsg: 'Invalid Credentials' });
    }
    const valid = await bcrypt.compare(password, User.password);

    if (!valid) {
      return res.status(400).json({ errmsg: 'Invalid Credentials' });
    }

    jwt.sign(
      {
        user: {
          id: user.id
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(400).end('error in user-login api');
  }
});

//Apply to a Job
router.post('/apply/:id', middleware, async (req, res) => {
  //   console.log(req.body);
    try {
      const user = await User.findById(req.user.id).select('-password');
      if(!user) res.status(401).json({
        msg: 'user not logged in'
      });
      
      const job = await Job.findById(req.params.id);
      if(!job)   res.status(401).json({
        msg: 'job does not exist'
      });

      if (
        job.applicants.filter(app => app.user.toString() === req.user.id).length > 0
      ) {
        return res.status(400).json({ msg: 'Job already applied' });
      }
  
      job.applicants.unshift({ user: req.user.id });
      await job.save();
      
      user.applications.unshift(req.params.id);
      await user.save();

      res.status(200).json({
        msg: 'Job applied successfully'
      }); 
    } catch (err) {
      res.status(400).end(err.errmsg);
    }
});

//List all applied jobs and their status.
router.get('/my_apps', middleware, async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id).populate('applications');
    // console.log(user);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({
      msg: 'error in user-auth api'
    });
  }
});

// Delete a job application. I created it this way so that if a user get's rejected he doesn't delete and reapply
router.post('/delete/:id', middleware, async (req, res) => {
  //   console.log(req.body);
    try {
      const user = await User.findById(req.user.id).select('-password');
      if(!user) res.status(401).json({
        msg: 'user not logged in'
      });
      
      const job = await Job.findById(req.params.id);
      if(!job)   res.status(401).json({
        msg: 'job does not exist'
      });

      if (
        job.applicants.filter(app => app.user.toString() === req.user.id).length == 0
      ) {
        return res.status(400).json({ msg: 'Job not applied' });
      }
  
      job.applicants=job.applicants.map(app => {
        if(app.user.toString() === req.user.id) app.status='deleted';
        return app;
      });
      await job.save();
      res.status(200).json({
        msg: 'Job deleted successfully'
      }); 
    } catch (err) {
      res.status(400).end(err.errmsg);
    }
});

module.exports = router;
