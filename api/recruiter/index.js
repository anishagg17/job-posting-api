const express = require('express');
const Recruiter = require('../../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const middleware = require('./middleware');

//Get currently authenticated Recruiter
router.get('/', middleware, async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.recruiter.id).select('-password');
    res.json(recruiter);
  } catch (err) {
    console.error(err);
    res.status(401).json({
      msg: 'error in auth.js api'
    });
  }
});

//Register a Recruiter
router.post('/signUp', async (req, res) => {
  // console.log(req.body);
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const newRecruiter = { ...req.body, password };
    const result = await Recruiter.create(newRecruiter);

    jwt.sign(
      {
        recruiter: {
          id: result._id
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
    res.status(400).end(err.errmsg);
  }
});

//Authenticate Recruiter
router.post('/logIn', async (req, res) => {
  // console.log("auth rec");
  try {
    const { email, password } = req.body;
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(400).json({ errmsg: 'Invalid Credentials' });
    }
    const valid = await bcrypt.compare(password, Recruiter.password);

    if (!valid) {
      return res.status(400).json({ errmsg: 'Invalid Credentials' });
    }

    jwt.sign(
      {
        recruiter: {
          id: recruiter.id
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
    res.status(400).end('error in recruiter-login api');
  }
});

module.exports = router;
