const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt")
const User = require('./models/Schema'); // Import the user model from your models directory

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                return done(null, false, { message: 'No user with this email' });
            }

            // Since you've removed bcrypt password comparison, you might have your own authentication logic here
            
            // For example:
            console.log(user)
            if (bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        return done(null, user);
    });
}

module.exports = initialize;
