const { createConversation, getConversationById, getFilteredUserToStartConversations } = require("../controllers/conversation.controller");

const router = require("express").Router();

router.post("/", createConversation);
router.get("/not-started", getFilteredUserToStartConversations);
router.get("/:user_id", getConversationById);

module.exports = router;