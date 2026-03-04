const Conversation = require("../models/conversations.model");
const Message = require("../models/messages.model");
const UserModel = require("../models/user.model");

const createMessage = async (req, res, next) => {
    try {
        const { conversation_id = "", sender_id, message, receiver_id = "" } = req.body;
        if (!sender_id || !message) {
            return next({
                msg: "Please fill all required fields",
                status: 400
            })
        }
        if (!conversation_id && receiver_id) {
            const newConversation = await Conversation.create({ members: [sender_id, receiver_id] });
            const newMessages = await Message.create({ conversation_id: newConversation._id, sender_id, message });
            if (newMessages) {
                return res.json({
                    msg: "Message sent successfully by creating new conversation",
                    data: newMessages,
                    status: 200
                })
            }
        }
        if (!conversation_id && !receiver_id) {
            return next({
                msg: "Receiver is required if you want to start a new conversation",
                status: 400
            })
        }

        const newMessage = await Message.create({ conversation_id, sender_id, message });
        if (newMessage) {
            res.json({
                msg: "Message sent in existing conversation",
                data: newMessage,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

const getMessageById = async (req, res, next) => {
    try {
        const conversation_id = req.params.id;
        if (conversation_id === "new") {
            return res.json({
                data: [],
                status: 200
            })
        }
        const messages = await Message
            .find({ conversation_id })
            .populate("sender_id", "full_name email")
            .sort({ createdAt: 1 });

        const messageUserData = await Promise.all(messages.map(async (msg) => {
            const user = await UserModel.findById(msg.sender_id);
            return {
                user: {
                    email: user.email,
                    full_name: user.full_name,
                    _id:user._id
                },
                message: msg.message
            }
        }))

        // const messageUserData = messages.map(msg => ({
        //     user: msg.sender_id,
        //     message: msg.message,
        //     createdAt: msg.createdAt
        // }));

        // const finalmessageUserData = await messageUserData;
        if (messageUserData) {
            res.json({
                msg: "Message fetched successfully",
                data: messageUserData,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

module.exports = { createMessage, getMessageById }