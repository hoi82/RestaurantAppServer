const mongoose = require("mongoose");
const { schema } = require("./review");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    menuid: Schema.Types.ObjectId,
    quantity: Schema.Types.Number,
}, { _id: false });

const PriceSchema = new Schema({
    menuid: Schema.Types.ObjectId,
    quantity: Schema.Types.Number,
    priceperunit: Schema.Types.Number,
    menutotalprice: Schema.Types.Number
}, { _id: false });

const TakeoutSchema = new Schema({
    resid: Schema.Types.ObjectId,
    userid: Schema.Types.ObjectId,
    order: [OrderSchema],
    price: [PriceSchema],
    totalprice: Schema.Types.Number,
    deleted: Schema.Types.Boolean,
    created: Schema.Types.Date,
    edited: Schema.Types.Date
}, { collection: "takeouts" });

module.exports = mongoose.model("Takeout", TakeoutSchema);