const { Restaurant } = require("../models/restaurant");

module.exports = (app = require("express")()) => {
    const Takeouts = require("../models/takeout");
    const Users = require("../models/user");
    const Restaurants = require("../models/restaurant");
    const Menus = require("../models/menu");

    //TODO: 여기부터 해야됨

    app.post("/api/takeout", (req, res) => {        
        const takeout = new Takeouts();
        const data = req.body;        

        takeout.userid = data.userid;
        takeout.resid = data.resid;
        takeout.orders = data.orders;        
        takeout.totalprice = data.totalprice;
        takeout.created = new Date();
        takeout.deleted = false;
        takeout.edited = new Date();

        takeout.save((err, result) => {
            if (err) {                
                res.status(402).json(err);
            }
            else {                
                res.json(result._id);
            }
        });
    });

    app.get("/api/takeout/:id", (req, res) => {
        const result = {};

        Takeouts.findOne({_id: req.params.id, deleted: false}).then((takeout) => {
            if (takeout) {
                result.orders = takeout.orders;                
                result.totalprice = takeout.totalprice;
                Restaurant.findById(takeout.resid).then((restaurant) => {
                    if (restaurant) {
                        result.resid = restaurant._id;
                        result.restaurantname = restaurant.name;
                        result.restaurantaddress = restaurant.address;
                        
                        Users.findById(takeout.userid).then((user) => {
                            if (user) {
                                result.username = user.name;
                                res.json(result);                                
                            }
                            else {
                                res.status(404).json("User is not found");
                            }
                        })
                    }
                    else {
                        res.status(404).json("Restaurant is not found");
                    }                    
                }).catch((err) => {
                    res.json(400).json(err.message);
                })
            }
            else {
                res.status(404).json("Order is not found");
            }
        }).catch((err) => {            
            res.status(400).json(err.message);
        })
    });

    app.get("/api/takeouts/:id", (req, res) => {        
        Takeouts.find({userid: req.params.id, deleted: false}, (err, takeouts) => {            
            if (err) {

            }
            else {
                res.json(takeouts);
            }
        })
    })
}