module.exports = (app = require("express")()) => {
    const Menu = require("../models/menu");  
    
    //Get Menu by Restaurant ID
    app.get("/api/menu/:id", (req, res) => {
        Menu.findById(req.params.id, (err, menu) => {            
            res.json(menu);
        })
    });   
}