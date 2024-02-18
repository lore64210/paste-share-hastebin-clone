const mongoose = require("mongoose");

const Pastebin = mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    creationTime: {
        type: Date,
        required: true,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Pastebin", Pastebin);
