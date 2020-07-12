module.exports = (app = require("express")()) => {
    const Location = require("../models/location");
    const Categories = require("../models/restaurant").Category;
    const RestaurantNames = require("../models/restaurant").RestaurantNames;
    const Restaurants = require("../models/restaurant").Restaurant;   

    //Get All Locations
    app.get("/api/locations", (req, res, next) => {
        Location.find((err, locations) => {
            if (err) {
                return next(err);
            }

            res.json(locations);
        })
    });

    app.get("/api/filter/locations", (req, res, next) => {
        Location.find({}, (err, locations) => {
            if (err) {
                return next(err);
            }

            res.json(locations);
        })
    })

    //Get All Restaurant Names
    app.get("/api/filter/names", (req, res, next) => {
        const maxCount = parseInt(req.query.maxCount) || 0;
        RestaurantNames.find().where("name").regex(new RegExp(req.query.name, "gi")).limit(maxCount).distinct("name", (err, names) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(names);
            }            
        });    
    });

    //Get All Categories
    app.get("/api/filter/categories", (req, res, next) => {
        Categories.find({}, "-_id", (err, categories) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(categories);
            }            
        });
    });

    //Get All Countries
    app.get("/api/filter/countries", (req, res, next) => {        
        Location.find().distinct("name", (err, countries) => {
            if (err) {
                console.log(err);
                return next(err);
            }
            else {
                res.json(countries.filter((country) => country.toLowerCase().indexOf(req.query.name.toLowerCase()) > -1));
            }            
        })  
    });

    //Get States By Country
    app.get("/api/filter/states", (req, res, next) => {        
        Location.findOne().where("name").equals(req.query.country).then((country) => {
            res.json(country.states.map((state) => state.name));
        }).catch((err) => {
            next(err);
        });
    });

    //Search by name
    app.get("/api/search/name/:name", (req, res, next) => {        
        Restaurants.find({name: { $regex: `${req.params.name}`, $options: "gi" }}, (err, restaurants) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(restaurants);
            }            
        })
    });

    //Search by category
    app.get("/api/search/category/:category", (req, res, next) => {
        Restaurants.find({category: req.params.category}, (err, restaurants) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(restaurants);
            }            
        })
    });

    //Search by location
    app.get("/api/search/location", (req, res, next) => {
        let filter = {};
        if (req.query.country) {
            Object.assign(filter, { "address.country" : req.query.country });
        }

        if (req.query.state) {
            Object.assign(filter, { "address.state" : req.query.state });
        }

        Restaurants.find(filter, (err, restaurants) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(restaurants);
            }            
        })        
    });

    return app;
}