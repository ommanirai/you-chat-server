const UserModel = require("../models/user.model")

const getAllUser = async (req, res, next) => {
    try {
        const user = await UserModel.find({}, { email: 1, full_name: 1 });
        if (!user.length) {
            return next({
                msg: "No users found",
                status: 400
            })
        }
        res.json({
            data: user,
            status: 200
        })
    }
    catch (err) {
        return next(err)
    }
}

const getFilteredUserToStartConversation = async (req, res, next) => {
    try {
        // const alreadyConnectedUsers = req.query.ids.split(",");
        let alreadyConnectedUsers = req.query.ids || req.query['ids[]'] || [];

        if (!Array.isArray(alreadyConnectedUsers)) {
            alreadyConnectedUsers = alreadyConnectedUsers.split(",");
        }

        const conversationNotStartedYet = await UserModel.find({ _id: { $nin: alreadyConnectedUsers } });
        // if (!conversationNotStartedYet.length) {
        //     return next({
        //         msg: "No new users found for new conversation",
        //         status: 400
        //     })
        // }
        res.json({
            data: conversationNotStartedYet,
            status: 200
        })
    }
    catch (err) {
        return next(err)
    }
}

module.exports = { getAllUser, getFilteredUserToStartConversation }