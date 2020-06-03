const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    resID: Schema.Types.ObjectId,
    userID: Schema.Types.ObjectId,
    rating: Schema.Types.Number,
    title: Schema.Types.String,
    comment: Schema.Types.String,
    created: Schema.Types.Date,
    edited: Schema.Types.Date,
    deleted: Schema.Types.Boolean
}, { collection: "reviews" });

module.exports = mongoose.model("Review", ReviewSchema);