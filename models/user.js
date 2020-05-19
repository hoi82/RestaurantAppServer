const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    payments: [Object],
    created: Date,
    edited: Date,
    deleted: Boolean
}, { collection: "userInfo" });

module.exports = mongoose.model("User", userSchema);