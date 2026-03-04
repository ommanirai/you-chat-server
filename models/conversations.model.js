const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId

const ConversationSchema = new mongoose.Schema({
    members: [
        {
            type: objectId,
            ref: "user",
            required: true,
        }
    ],
}, {
    timestamps: true
})

const Conversation = mongoose.model("conversation", ConversationSchema)
module.exports = Conversation