const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')

const app = express()

// Load routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')

// Load Passport Config
require('./config/passport')(passport)

// Db config
const db = require('./config/database')

// Connect to mongoose
mongoose
  .connect(
    db.mongoURI,
    { useNewUrlParser: true },
  )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

// Handle bars Middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

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

// Pasport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
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

// Use routes
app.use('/ideas', ideas)
app.use('/users', users)

// Listen to server
const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`Server is starting on ${port}`)
})
