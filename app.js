const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

// Connect to mongoose
mongoose
  .connect(
    'mongodb://rangigo:Panigo010697@ds247121.mlab.com:47121/rangigo',
    { useNewUrlParser: true },
  )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

// Load Idea Model
require('./models/Idea')
const Idea = mongoose.model('ideas')

// Handle bars Middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Method Override Middleware
app.use(methodOverride('_method'))

// Express Session Middleware
app.use(
  session({
    secret: 'mysterious dude',
    resave: true,
    saveUninitialized: true,
  }),
)

app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

// Main route
app.get('/', (req, res) => {
  const title = 'Phuoc'
  res.render('index', {
    title: title,
  })
})

//About route
app.get('/about', (req, res) => {
  res.render('about', {})
})

// Ideas Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas,
      })
    })
})

//Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add')
})

//Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then(idea => {
    res.render('ideas/edit', {
      idea: idea,
    })
  })
})

//Handle Post Form
app.post('/ideas', (req, res) => {
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
    const newUser = {
      title: req.body.title,
      details: req.body.details,
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video added!')
        res.redirect('/ideas')
      })
      .catch(err => console.log(err))
  }
})

// Handle Edit Form
app.put('/ideas/:id', (req, res) => {
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
          req.flash('success_msg','Video idea updated')
          res.redirect('/ideas')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg', 'Video idea removed')
    res.redirect('/ideas')
  })
})

// Listen to server
const port = 8000

app.listen(port, () => {
  console.log(`Server is starting on ${port}`)
})
