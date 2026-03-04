const { createMessage, getMessageById } = require("../controllers/message.controller");

const router = require("express").Router();

router.post("/", createMessage);
router.get("/:id", getMessageById)

module.exports = router;