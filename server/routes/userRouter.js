const express = require('express')
const router = express.Router()
const multer = require('multer')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const SECRET = process.env.SECRET

const User = require('../models/User')

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  User.findOne({ email }, (err, user) => {
    if (err) { return done(err) }
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' })
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    })
  })
}))


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
  }
})

const upload = multer({ storage: storage }).single('profile')


router.get('/login', (req, res) => {
  res.render('User/login')
})

router.get('/register', (req, res) => {
  res.render('User/register', { message: req.flash('message') })
})
//
/*router.get('/dashboard', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.SECRET)
  res.json({ auth: true, token })
})*/

//
router.get('/profile', (req, res) => {
  res.render('dashboard/profile')
})



//login 
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    // create and assign jwt token
    const token = jwt.sign({ id: user._id }, process.env.SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  })(req, res, next);
});

router.get('/dashboard', verifyToken, function (req, res, next) {
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});
function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err)
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}




router.post('/profile', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
    const profileUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename
    User.findByIdAndUpdate(req.user.id, { profile: profileUrl }, (err, user) => {
      if (err) {
        return res.status(500).json({ message: err.message })
      }
      res.json({ message: 'Profile image uploaded successfully' })
    })
  })
})
//Registering Our user
router.post('/register', (req, res) => {
  const { email, fullName, password } = req.body
  User.create({
    email,
    fullName,
    password
  })
    .then(user => {
      req.flash('success_msg', 'You are now registered and can log in')
      res.redirect('/login')
    })
    .catch(err => {
      req.flash('error_msg', 'Registration failed. Please try again')
      res.redirect('/register')
      console.log(err)
    })
})

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
})

// Deserialize user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

module.exports = router
/*  router.post('/login', passport.authenticate('local',Error, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
    
}))
*/



/* router.post('/login',passport.authenticate,('local'),(req, res) => {
   const { email, password } = req.body
 
   User.findOne({ email }, (err, user) => {
     if (err) {
       return res.status(500).json({ message: 'Error logging in' })
     }
 
     if (!user) {
       return res.status(401).json({ message: 'Invalid email or password' })
     }
 
     bcrypt.compare(password, user.password, (err, isMatch) => {
       if (err) {
         return res.status(500).json({ message: 'Error logging in' })
       }
 
       if (!isMatch) {
         return res.status(401).json({ message: 'Invalid email or password' })
       }
 
       // If email and password match, create a JWT and send it in the response
       const token = jwt.sign({ id: user._id }, process.env.SECRET)
       res.render('dashboard/profile.ejs')
     })
   })
 })
 */
