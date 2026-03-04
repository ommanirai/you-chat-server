const { getAllUser, getFilteredUserToStartConversation } = require("../controllers/user.controller");

const router = require("express").Router();

router.get("/", getAllUser);
router.get("/filter/start-conversation", getFilteredUserToStartConversation);

module.exports = router;