const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    resid: Schema.Types.ObjectId,
    userid: Schema.Types.ObjectId,
    time: Schema.Types.Date,   
    name: Schema.Types.String, 
    timezone: Schema.Types.String,
    member: Schema.Types.Number,
    message: Schema.Types.String,
    created: Schema.Types.Date,
    edited: Schema.Types.Date,
    deleted: Schema.Types.Boolean    
}, {collection: "reservations"});

ReservationSchema.index({resid: 1, time: 1}, {unique: true});

module.exports = mongoose.model("Reservations", ReservationSchema);