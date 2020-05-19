const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var State = new Schema({
    code: {type: String},
    name: {type: String},
    subdivision: {type: String}
})

var Location = new Schema({
    code2: {type: String},
    code3: {type: String},
    name: {type: String},
    capital: {type: String},
    region: {type: String},
    subregion: {type: String},
    states: [State]
}, {collection: "locations"});

module.exports = mongoose.model("Locations", Location);