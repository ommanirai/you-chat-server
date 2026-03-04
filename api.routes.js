const router = require("express").Router();
const authRouter = require("./routers/auth.route");
const conversationRouter = require("./routers/conversation.route");
const messageRouter = require("./routers/message.route");
const userRouter = require("./routers/user.route");
const authenticate = require("./middlewares/authenticate")

router.use("/", (req, res, next) => {
    res.json({
        msg: "You Chat Running Successfully",
        status: 200
    })
})

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/conversation", authenticate, conversationRouter);
router.use("/message", authenticate, messageRouter);

module.exports = router;