const { createConversation, getConversationById } = require("../controllers/conversation.controller");

const router = require("express").Router();

router.post("/", createConversation);
router.get("/:user_id", getConversationById);

module.exports = router;