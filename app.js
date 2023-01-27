require('dotenv').config()
const express=require('express')
const articleRouter=require('./server/routes/articleRouter')
const userRouter=require('./server/routes/userRouter')
const flash = require('connect-flash')
const session = require('express-session')
const passport=require('passport')
const path=require('path')
const mongoose=require('mongoose')
const app=express()

mongoose.connect('mongodb://127.0.0.1:27017/Blog',{
    useNewUrlParser: true, useUnifiedTopology: true
})

app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 8 * 60 * 60 * 1000
    }
  }))
  

app.set(express.static(path.join(__dirname, 'public')))

app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')))

app.use('/bootstrap', express.static(path.resolve(__dirname, 'public/admin/bootstrap')))

app.set('view engine', 'ejs')
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/',articleRouter)
app.use('/',userRouter)

app.listen(3000)