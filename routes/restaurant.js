module.exports = (app = require("express")()) => {
    const Restaurants = require("../models/restaurant").Restaurant;   
    const Menus = require("../models/menu");
    const Reviews = require("../models/review");

    //Get All Restaurants
    app.get("/api/restaurants", (req, res) => {
        Restaurants.find((err, restaurants) => {
            res.json(restaurants);
        })
    });                

    //Get Restaurant by ID include Reviews
    app.get("/api/restaurant/:id", (req, res) => {        
        Restaurants.findById(req.params.id).then((restaurant) => {
            const result = restaurant.toObject();
            Menus.find({restaurantID: restaurant._id}).then((menus) => {
                result.menus = menus;
                res.json(result);                
            });
        });        
    });

    //Get Restaurant Thumbnail
    app.get("/api/restaurant/thumbnail/:id", (req, res) => {
        Restaurants.findById(req.params.id, "name _id thumbnail address", (err, restaurant) => {            
            res.json(restaurant);
        })
    });
}