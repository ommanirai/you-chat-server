const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const MessageSchema = new mongoose.Schema({
    conversation_id: {
        type: objectId,
        ref: "conversation",
        // required: true
    },
    sender_id: {
        type: objectId,
        ref: "user",
    },
    message: {
        type: String
    }
}, {
    timestamps: true
})

const Message = mongoose.model("message", MessageSchema)
module.exports = Message