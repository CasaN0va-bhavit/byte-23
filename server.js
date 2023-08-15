// Spin the wheel
// Betting
// Quiz

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bcrypt = require("bcrypt")
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const methodOverride = require('method-override')
const mongoose = require('mongoose');

const User = require('./models/Schema');


const initializePassport = require("./passport-config");
initializePassport(
    passport,
    email => User.findOne({ email: email }),
    id => User.findById(id)
)

// const users = []

const app = express();
app.use(express.urlencoded({ extended: false }))
app.set("view-engine", "ejs")
app.set('views', 'views')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.get('/', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('index.ejs', {name: req.user.name, coins: 0})
        } else {
            return res.render('index.ejs', {name: req.user.name, coins: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/random', (req, res) => {
    res.render('random.ejs')
})

app.post('/random', async (req, res) => {
    await User.updateOne({name: req.body.username}, {$set: {amount: 150}})
})

app.get('/success', (req, res) => {
    res.render('success.ejs')
});

app.get('/cancel', (req, res) => {
    res.render('cancel.ejs')
});

const DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1Nee1sSEAo4msgGAF0PmErpK',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${DOMAIN}/success`,
    cancel_url: `${DOMAIN}/cancel`,
  });

  res.redirect(303, session.url);
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // smth
        }
    })
    res.redirect('/login');
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            amount: 0
        });

        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register');
    }
});

app.get('/meme', (req, res) => {
    res.render('meme.ejs')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }


    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

app.listen(3000, function(){
   console.log('Server started at port 3000');
});