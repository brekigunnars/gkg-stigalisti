const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Production security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "bootswatch.com", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'", "cdnjs.cloudflare.com"]
      }
    }
  }));
  app.use(compression()); // Compress responses
}

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/golf-team-tracker';

// Connect to MongoDB
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT and DELETE requests
app.use(methodOverride('_method'));

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.DISABLE_SECURE_COOKIE !== 'true',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/players', require('./routes/players'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Síða fannst ekki',
    message: 'Síðan sem þú ert að leita að er ekki til.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Villa kom upp',
    message: process.env.NODE_ENV === 'production' 
      ? 'Villa kom upp. Vinsamlegast reyndu aftur síðar.' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on port ${PORT}`)); 