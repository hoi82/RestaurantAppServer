module.exports = (app = require("express")()) => {
    const Menu = require("../models/menu");  
    
    //Get Menu by Restaurant ID
    app.get("/api/menus/:id", (req, res) => {
        Menu.find({restaurantID: req.params.id}, (err, menus) => {
            if (err) {

            }
            else {
                res.json(menus);
            }            
        })
    });   

    app.get("/api/menu/:id", (req, res) => {
        Menu.findById(req.params.id, (err, menu) => {
            if (err) {

            }
            else {
                res.json(menu);
            }
        })
    })
}