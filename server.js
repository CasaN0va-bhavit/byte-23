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
const cookieParser = require('cookie-parser');
const globalUserName = "";

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
app.use(cookieParser())
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

app.post('/login', checkNotAuthenticated, (req, res, next) => {
    loginUser(req, res, next)
});

app.get('/random', (req, res) => {
    res.render('random.ejs')
})

// Take the money
// Sort the array
// Place it on the frontend


app.post('/random', async (req, res) => {
    const email = req.cookies["username"];
    // console.log(email);
    const price = parseInt(req.body.price)
    await User.updateOne({email: email}, {$set: {amount: price}})
    res.render('success.ejs')
})

app.get('/roll-the-dice', (req, res) => {
    res.render('roll-the-dice.ejs', {
        amount: null,
        dice1: null,
        dice2: null
    })
})

app.post('/roll-the-dice', (req, res) => {
    const possibilities = [1,1,1,2,2,3,3,4,5,6]
    const chosenNumberDiceOne = possibilities[Math.floor(Math.random() * 10)]
    const chosenNumberDiceTwo = possibilities[Math.floor(Math.random() * 10)]
    const totalNumber = chosenNumberDiceOne + chosenNumberDiceTwo
    console.log(totalNumber)
    if (totalNumber == 12) {
        res.render('roll-the-dice.ejs', {
            dice1: chosenNumberDiceOne,
            dice2: chosenNumberDiceTwo,
            amount: parseInt(req.body.amount) * 3
        })
    }
    if (totalNumber >= 7) {
        res.render('roll-the-dice.ejs', {
            dice1: chosenNumberDiceOne, 
            dice2: chosenNumberDiceTwo,
            amount: parseInt(req.body.amount) * 1.5
        })
    } else {
        res.render('roll-the-dice.ejs', {
            dice1: chosenNumberDiceOne, 
            dice2: chosenNumberDiceTwo,
            amount: -(parseInt(req.body.amount))})
    }
})

app.get('/success', (req, res) => {
    res.render('success.ejs')
});

app.get('/cancel', checkAuthenticated, (req, res) => {
    res.render('cancel.ejs')
});

const DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', checkAuthenticated, async (req, res) => {
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

app.get('/meme', checkAuthenticated, (req, res) => {
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

function loginUser(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) res.send([{ msg: info.message }]);
        else {
            req.logIn(user, (err) => {
                if (err) throw err;
                res.cookie("username", user.email)
                res.redirect('/');
            });
        }
    })(req, res, next);
}

app.listen(3000, function(){
   console.log('Server started at port 3000');
});