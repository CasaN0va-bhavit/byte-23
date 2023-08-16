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
app.use(express.json())
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
            return res.render('index.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('index.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/login', checkNotAuthenticated, async (req, res) => {
    res.render('login.ejs', {amount: null})
});

app.post('/login', checkNotAuthenticated, (req, res, next) => {
    loginUser(req, res, next)
});

app.get('/random', async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('random.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('random.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})

// Take the money
// Sort the array
// Place it on the frontend


app.post('/random', async (req, res) => {
    const email = req.cookies["username"];
    // console.log(email);
    const price = parseInt(req.body.price)
    await User.updateOne({email: email}, {$set: {amount: price}})
    res.render('success.ejs', {amount: 0})
})

app.get('/roll-the-dice', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('roll-the-dice.ejs', {name: req.user.name, amount: 0, dice1: 0, dice2: 0})
        } else {
            return res.render('roll-the-dice.ejs', {name: req.user.name, amount: requiredUser.amount, dice1: 0, dice2: 0})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
    res.render('roll-the-dice.ejs', {
        amount: 0,
        dice1: 0,
        dice2: 0
    })
})

app.post('/roll-the-dice', async (req, res) => {
    const possibilities = [1,1,1,2,2,3,3,4,5,6]
    const chosenNumberDiceOne = possibilities[Math.floor(Math.random() * 10)]
    const chosenNumberDiceTwo = possibilities[Math.floor(Math.random() * 10)]
    const totalNumber = chosenNumberDiceOne + chosenNumberDiceTwo
    console.log(totalNumber)
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (totalNumber == 12) {
            const amountToSet = requiredUser.amount + (parseInt(req.body.amount) * 3)
            res.render('roll-the-dice.ejs', {
                dice1: chosenNumberDiceOne,
                dice2: chosenNumberDiceTwo,
                amount: amountToSet
            })
        }
        if (totalNumber >= 7) {
            const amountToSet = requiredUser.amount + (parseInt(req.body.amount) * 1.5)
            res.render('roll-the-dice.ejs', {
                dice1: chosenNumberDiceOne, 
                dice2: chosenNumberDiceTwo,
                amount: amountToSet
            })
        } else {
            const amountToSet = requiredUser.amount - parseInt(req.body.amount)
            res.render('roll-the-dice.ejs', {
                dice1: chosenNumberDiceOne, 
                dice2: chosenNumberDiceTwo,
                amount: amountToSet
            })
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})
const DOMAIN = 'http://localhost:3000';


app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1Ne8PTSEAo4msgGAv1bXyu31',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/success`,
      cancel_url: `${DOMAIN}/cancel`,
    });
    
    res.redirect(303, session.url);
  });


app.get('/cancel', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('cancel.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('cancel.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/success', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('success.ejs', {name: req.user.name, amount: 0})
        } else {
            // const oldAmount = requiredUser.amount;
            // const newAmount = oldAmount + 50;
            // await User.updateOne({name: req.user.name}, {$set: {amount: newAmount}})
            return res.render('success.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/pot', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('pot.ejs', {name: req.user.name, amount: 0})
        } else {
            if (requiredUser.betFor === 'musk') {
                return res.render('pot.ejs', {name: req.user.name, betZuck: requiredUser.bet, betMusk: null})
            } else if (requiredUser.betFor === 'zuck') {
                return res.render('pot.ejs', {name: req.user.name, betMusk: requiredUser.bet, betZuck: null})
            } else {
                return res.render('pot.ejs', {name: req.user.name, bet: null, betFor: null})
            }
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {amount: null})
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            
        }
    })
    res.clearCookie('username')
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            res.clearCookie('username')
        }
    })
    res.clearCookie('username')
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
        console.log(newUser);
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register');
    }
});

app.get('/meme', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('meme.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('meme.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/elon', checkAuthenticated, async(req,res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('choseMusk.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('choseMusk.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})

app.post('/elon', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('choseMusk.ejs', {name: req.user.name, amount: 0})
        } else {
            await User.updateOne({
                email: req.cookies["username"]}, 
                {$set: 
                    {
                        betFor: 'musk', 
                        bet: req.body.coins
                    }
                })
            return res.send("L")
            
        }
    } catch (error) {
        res.send('Error')
    }
})
app.get('/zuck', checkAuthenticated, async (req,res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('choseZuck.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('choseZuck.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})

app.post('/zuck', checkAuthenticated, async(req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('choseZuck.ejs', {name: req.user.name, amount: 0})
        } else {
            await User.updateOne({
                email: req.cookies["username"]}, 
                {$set: 
                    {
                        betFor: 'zuck', 
                        bet: req.body.coins
                    }
                })
            return res.send("L")
            
        }
    } catch (error) {
        res.send('Error')
    }
})

app.get('/bet', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('bet.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('bet.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
})

app.get('/arena', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('arena.ejs', {name: req.user.name, amount: 0})
        } else {
            console.log(requiredUser)
            return res.render('arena.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
});

app.get('/spin-the-wheel', checkAuthenticated, async (req, res) => {
    try {
        const requiredUser = await User.findOne({name: req.user.name})
        if (!requiredUser) {
            return res.render('spinTheWheel.ejs', {name: req.user.name, amount: 0})
        } else {
            return res.render('spinTheWheel.ejs', {name: req.user.name, amount: requiredUser.amount})
        }
    } catch(err) {
        console.log(err)
        res.send("Error")
    }
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