const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    isActivated: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    passwordResetTokenExpiry: Date,
}, {
    timestamps: true
})

const UserModel = mongoose.model("user", UserSchema)
module.exports = UserModel