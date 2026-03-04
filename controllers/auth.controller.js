const UserModel = require("./../models/user.model");
const hashPassword = require("password-hash");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const client_url = process.env.CLIENT_URL;
// const googleRecaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
// const googleRecaptchaAPI = process.env.GOOGLE_RECAPTCHA_API;

const sender = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

function prepareMail(data) {
    return {
        from: "Ommani Rai",
        to: "ommanirai27@gmail.com," + data.email,
        subject: "Verify Your Account",
        text: "Account Verification Link",
        html: `
            <p>Hi <strong>${data.full_name}</strong>,</p>
            <p>Your registration is successfull. Please use link below to verify your account.</p>
            <p><a href="${data.link}">Click here to verify account</a></p>
            <p>If you have not created your account, Please kindly ignore this email.</p>
            <p><strong>Regards</strong>,</p>
            <p>Chat App</p>
        `
    }
}

function createToken(user) {
    let token = jwt.sign({
        full_name: user.full_name,
        email: user.email,
        _id: user._id,
        role: user.role,
        status: user.isActivated
    }, process.env.JWT_SECRET)
    return token;
}

const signUp = async (req, res, next) => {
    try {
        const { full_name, email, password } = req.body;
        if (!full_name || !email || !password) {
            return next({
                msg: "Please fill all required fields.",
                status: 400
            })
        }
        const user = await UserModel.findOne({ email })
        if (user) {
            return next({
                msg: "User already exists.",
                status: 400
            })
        }
        const hash_password = hashPassword.generate(password);
        const newUser = await UserModel.create({ full_name, email, password: hash_password });
        var emailData = {
            full_name: newUser.full_name,
            email: newUser.email,
            link: `${client_url}/auth/account-verification/${newUser._id}`
        }
        var emailContent = prepareMail(emailData)
        if (newUser) {
            var info = await sender.sendMail(emailContent)
            res.json({
                msg: "Signup successfully",
                emailInfo: info,
                data: newUser,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // const { email, password, recaptcha_value } = req.body;
        if (!email || !password) {
            return next({
                msg: "Required fields missing",
                status: 400
            })
        }
        // if (!recaptcha_value) {
        //     return next({
        //         msg: "Missing ReCaptcha",
        //         status: 400
        //     })
        // }
        // const response = await fetch(googleRecaptchaAPI, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/x-www-form-urlencoded",
        //     },
        //     body: new URLSearchParams({
        //         secret: googleRecaptchaSecretKey,
        //         response: recaptcha_value
        //     })
        // })
        // const googleResponse = await response.json();
        // if (!googleResponse.success) {
        //     return next({
        //         msg: "Invalid reCaptcha value or secret key",
        //         status: 400
        //     })
        // }
        const user = await UserModel.findOne({ email })
        if (!user) {
            return next({
                msg: "Email not registered yet.",
                status: 400
            })
        }
        if (user.isActivated) {
            return next({
                msg: "Your account is unverified. Please verify your account to login",
                status: 401
            })
        }
        var isMatched = hashPassword.verify(password, user.password)
        if (isMatched) {
            var token = createToken(user)
            res.json({
                msg: "Logged in successfully",
                user,
                token,
            })
        }
        else {
            return next({
                msg: "Invalid password",
                status: 400
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

module.exports = { signUp, signIn }