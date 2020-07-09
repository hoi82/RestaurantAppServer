module.exports = (app = require("express")()) => {
    const Menu = require("../models/menu");  
    
    //Get Menus by Restaurant ID
    app.get("/api/menus/:id", (req, res, next) => {
        Menu.find({restaurantID: req.params.id}, (err, menus) => {
            if (err) {
                return next(err);
            }            

            res.json(menus);            
        })
    });   

    //Get Single Menu
    app.get("/api/menu/:id", (req, res, next) => {
        Menu.findById(req.params.id, (err, menu) => {
            if (err) {
                return next(err);
            }            

            res.json(menu);            
        })
    });

    //Get Take Out menus by Restaurant ID
    app.get("/api/menus/takeout/:id", (req, res, next) => {        
        Menu.find({restaurantID: req.params.id, takeout: true}, (err, menus) => {
            if (err) {
                return next(err);
            }

            res.json(menus);            
        })
    })
}