const mongoose = require("mongoose");

const Pastebin = mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    creationTime: {
        type: Date,
        required: true,
        immutable: true,
        default: Date.now(),
    },
    lastVisited: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    visitCount: {
        type: Number,
        required: true,
        default: 1,
    },
});

module.exports = mongoose.model("Pastebin", Pastebin);
