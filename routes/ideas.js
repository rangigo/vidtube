const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { ensureAuthenticated } = require('../helpers/auth')

/**
 * Handle Ideas Routes
 */

// Load Idea Model
require('../models/Idea')
const Idea = mongoose.model('ideas')

// Ideas Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas,
      })
    })
})

//Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add')
})

//Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then(idea => {
    if (idea.user != req.user.id) {
      req.flash('error_msg', 'Not authorized!')
      res.redirect('/ideas')
    } else {
      res.render('ideas/edit', {
        idea: idea,
      })
    }
  })
})

//Handle Post Form
router.post('/', ensureAuthenticated, (req, res) => {
  const errors = []

  if (!req.body.title) {
    errors.push({ text: 'Please add a title' })
  }

  if (!req.body.details) {
    errors.push({ text: 'Please add details' })
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
    })
  } else {
    const newIdea = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
    }
    new Idea(newIdea)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video added!')
        res.redirect('/ideas')
      })
      .catch(err => console.log(err))
  }
})

// Handle Edit Form
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  })
    .then(idea => {
      // new values
      idea.title = req.body.title
      idea.details = req.body.details
      idea
        .save()
        .then(idea => {
          req.flash('success_msg', 'Video idea updated')
          res.redirect('/ideas')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg', 'Video idea removed')
    res.redirect('/ideas')
  })
})

module.exports = router
