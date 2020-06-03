const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    resid: Schema.Types.ObjectId,
    userid: Schema.Types.ObjectId,
    start: Schema.Types.Date,
    end: Schema.Types.Date,
    member: Schema.Types.Number,
    message: Schema.Types.String,
    created: Schema.Types.Date,
    edited: Schema.Types.Date,
    deleted: Schema.Types.Boolean    
}, {collection: "reservations"});

module.exports = mongoose.model("Reservations", ReservationSchema);