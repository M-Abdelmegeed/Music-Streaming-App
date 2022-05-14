const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcrypt");

module.exports = (passport) => {
    // Strategy
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                const user = await User.findOne({ email: email });
                if (!user) {
                    done(null, false);
                } else {
                    bcrypt.compare(
                        password + process.env.PEPPER,
                        user.password,
                        (err, isMatched) => {
                            if (isMatched) {
                                done(null, user);
                            } else {
                                done(null, false);
                            }
                        }
                    );
                }
            }
        )
    );



    // Serialize User
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize User
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
};
