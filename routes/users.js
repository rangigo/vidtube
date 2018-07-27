const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

// Load User Model
require('../models/User')
const User = mongoose.model('users')
/**
 * Handle User Routes
 */

// User Login Route
router.get('/login', (req, res) => {
  res.render('users/login')
})

// User Register Route
router.get('/register', (req, res) => {
  res.render('users/register')
})

// Handle Login Form 
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// Handle Register Form
router.post('/register', (req, res) => {
  const errors = []

  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Passwords do not match' })
  }

  if (req.body.password.length < 6) {
    errors.push({ text: 'Password must be at least 6 characters' })
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2,
    })
  } else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        req.flash('error_msg', 'Email already registered')
        res.redirect('/users/login')
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                req.flash('success_msg', 'You are now registered!')
                res.redirect('/users/login')
              })
              .catch(err => console.log(err))
          })
        })
      }
    })
  }
})

// Logout User
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/users/login')
})

module.exports = router
