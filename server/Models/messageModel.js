const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    chatId: String,
    senderId: String,
    text: String
})

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;