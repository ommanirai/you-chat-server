const Conversation = require("../models/conversations.model");
const UserModel = require("../models/user.model");

const createConversation = async (req, res, next) => {
    try {
        const { sender_id, receiver_id } = req.body;
        if (!sender_id || !receiver_id) {
            return next({
                msg: "Required fields missing",
                status: 400
            })
        }
        // check if conversation already exists
        const existing = await Conversation.findOne({
            members: { $all: [sender_id, receiver_id] }
        });

        if (existing) {
            return res.json({
                msg: "Conversation already exists",
                conversationId: existing._id
            });
        }
        const newConversation = await Conversation.create({ members: [sender_id, receiver_id] });
        if (newConversation) {
            res.json({
                msg: "Conversation Success",
                data: newConversation,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

const getConversationById = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        // find conversations where user is a member
        const conversation = await Conversation.find({ members: { $in: [user_id] } });
        // fetch other user info
        const conversationUserData = await Promise.all(conversation.map(async (con) => {
            const receiverId = con.members.find((member) => member.toString() !== user_id)
            const user = await UserModel.findById(receiverId);
            return {
                user: {
                    email: user.email,
                    full_name: user.full_name,
                    _id: user._id,
                },
                conversationId: con._id || "no id found"
            }
        }))
        if (conversationUserData) {
            res.json({
                msg: "Conversation data fetched",
                data: conversationUserData,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

const getFilteredUserToStartConversations = async (req, res, next) => {
    try {
        const logged_in_user = req.loggedInUser._id;
        const conversations = await Conversation.find({
            members: logged_in_user
        });

        const existingUserIds = conversations.flatMap(conv => conv.members.filter(member => member.toString() !== logged_in_user));

        const notStartedUsers = await UserModel
            .find({
                _id: {
                    $nin: [...existingUserIds, logged_in_user]
                }
            }).select("-password");

        if (notStartedUsers) {
            return res.json({
                data: notStartedUsers,
                status: 200
            })
        }
    }
    catch (err) {
        return next(err)
    }
}

module.exports = { createConversation, getConversationById, getFilteredUserToStartConversations }