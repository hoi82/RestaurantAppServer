const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
    id: {type: Schema.Types.ObjectId},
    restaurantID: {type: Schema.Types.ObjectId},
    name: {type: Schema.Types.String},
    ingredients: {type: Schema.Types.String},
    price: new Schema({
        value: {type: Schema.Types.Number},
        currency: {type: Schema.Types.String}
    })
}, {collection: "menus"});

module.exports = mongoose.model("Menus", MenuSchema);