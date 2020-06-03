const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var RestaurantSchema = new Schema({
    id: {type: Schema.Types.ObjectId},
    name: {type: String},
    thumbnail: {type: String},
    category: {type: String},
    address: {
        country: {type: String},
        state: {type: String},
        remains: {type: String}
    },
    menus: {type: Schema.Types.Array, default: []},
    opens: {
        timeZone: String,        
        time: {type: Schema.Types.Array}
    },
    reservation: Schema.Types.Mixed,
    contact: [ Object ],
    description: {type: String}    
}, {collection: "restaurants"});

var NamesSchema = new Schema({
    name: {type: String}    
}, {collection: "restaurants"});

var CategorySchema = new Schema({
    name: {type: String}
}, {collection: "categories"});

module.exports = {
    Restaurant : mongoose.model("Restaurants", RestaurantSchema),
    RestaurantNames : mongoose.model("RestaurantNames", NamesSchema),
    Category : mongoose.model("Categories", CategorySchema)
}
