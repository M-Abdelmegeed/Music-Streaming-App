const authenticate = require("./authenticated");
const user = require("../models/user");
function authorize(req, res, next) {
    console.log(req.user);
        if (req.user.role === "ADMIN") {
            next();
        } else {
            res.render("unauthorized.pug");
        }
}

module.exports = authorize;