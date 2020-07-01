const mongoose = require("mongoose");
const { schema } = require("./review");
const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
    menuid: Schema.Types.ObjectId,
    name: Schema.Types.String,
    thumbnail: Schema.Types.String,
    quantity: Schema.Types.Number,
    priceperunit: Schema.Types.Number,
    menutotalprice: Schema.Types.Number
}, { _id: false });

const TakeoutSchema = new Schema({
    resid: Schema.Types.ObjectId,
    userid: Schema.Types.ObjectId,    
    orders: [OrdersSchema],
    totalprice: Schema.Types.Number,
    deleted: Schema.Types.Boolean,
    created: Schema.Types.Date,
    edited: Schema.Types.Date
}, { collection: "takeouts" });

module.exports = mongoose.model("Takeout", TakeoutSchema);