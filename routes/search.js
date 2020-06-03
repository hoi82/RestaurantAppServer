module.exports = (app = require("express")()) => {
    const Location = require("../models/location");
    const Categories = require("../models/restaurant").Category;
    const RestaurantNames = require("../models/restaurant").RestaurantNames;
    const Restaurants = require("../models/restaurant").Restaurant;   

    //Get All Locations
    app.get("/api/locations", (req, res) => {
        Location.find((err, locations) => {
            res.json(locations);
        })
    });

    //Get All Restaurant Names
    app.get("/api/filter/names", (req, res) => {
        const maxCount = parseInt(req.query.maxCount) || 0;
        RestaurantNames.find().where("name").regex(new RegExp(req.query.name, "gi")).limit(maxCount).distinct("name", (err, names) => {            
            res.json(names);
        });    
    });

    //Get All Categories
    app.get("/api/filter/categories", (req, res) => {
        Categories.find({}, "-_id", (err, categories) => {
            res.json(categories);
        });
    });

    //Get All Countries
    app.get("/api/filter/countries", (req, res) => {        
        Location.find().distinct("name", (err, countries) => {            
            res.json(countries.filter((country) => country.toLowerCase().indexOf(req.query.name.toLowerCase()) > -1));
        })  
    });

    //Get States By Country
    app.get("/api/filter/states", (req, res) => {        
        Location.findOne().where("name").equals(req.query.country).then((country) => {                        
            res.json(country.states);
        })
    });

    //Search by name
    app.get("/api/search/name/:name", (req, res) => {        
        Restaurants.find({name: { $regex: `${req.params.name}`, $options: "gi" }}, (err, restaurants) => {
            res.json(restaurants);
        })
    });

    //Search by category
    app.get("/api/search/category/:category", (req, res) => {
        Restaurants.find({category: req.params.category}, (err, restaurants) => {
            res.json(restaurants);
        })
    });

    //Search by location
    app.get("/api/search/location", (req, res) => {
        let filter = {};
        if (req.query.country) {
            Object.assign(filter, { "address.country" : req.query.country });
        }

        if (req.query.state) {
            Object.assign(filter, { "address.state" : req.query.state });
        }

        Restaurants.find(filter, (err, restaurants) => {            
            res.json(restaurants);
        })        
    });

    return app;
}