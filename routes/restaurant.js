module.exports = (app = require("express")()) => {
    const Restaurants = require("../models/restaurant").Restaurant;   
    const Menus = require("../models/menu");
    const Reviews = require("../models/review");
    const Users = require("../models/user");

    //Get All Restaurants
    app.get("/api/restaurants", (req, res) => {
        Restaurants.find((err, restaurants) => {
            res.json(restaurants);
        })
    });                

    //Get Restaurant by ID
    app.get("/api/restaurant/:id", (req, res) => {                
        Restaurants.findById(req.params.id, (err, restaurant) => {
            if (err) {

            }
            else {
                res.json(restaurant);
            }
        })
    });

    //Get Restaurant Thumbnail
    app.get("/api/restaurant/thumbnail/:id", (req, res) => {
        Restaurants.findById(req.params.id, "name _id thumbnail address", (err, restaurant) => {            
            res.json(restaurant);
        })
    });
}