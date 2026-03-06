const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports = async function (req, res, next) {
    try {
        let token;
        if (req.headers['authorization']) {
            token = req.headers['authorization']
        }
        if (req.headers['x-acess-token']) {
            token = req.headers['x-acess-token']
        }
        if (req.query.token) {
            token = req.query.token
        }
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const updatedFreshUser = await UserModel.findById(decoded._id).select("-password")
            if (!updatedFreshUser) {
                return next({
                    msg: "Authentication failed. User not found",
                    status: 401
                })
            }
            req.loggedInUser = updatedFreshUser
            next()
        }
        else {
            next({
                msg: "Authentication failed, Token not provided",
                status: 400
            })
        }
    }
    catch (err) {
        return next(err)
    }
}