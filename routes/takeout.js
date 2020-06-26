module.exports = (app = require("express")()) => {
    const Takeouts = require("../models/takeout");

    app.post("/api/takeout", (req, res) => {        
        const takeout = new Takeouts();
        const data = req.body;        

        takeout.userid = data.userid;
        takeout.resid = data.resid;
        takeout.order = data.order;
        takeout.price = data.price;
        takeout.totalprice = data.totalprice;
        takeout.created = new Date();
        takeout.deleted = false;
        takeout.edited = new Date();

        takeout.save((err, result) => {
            if (err) {
                res.status(402).json(err);
            }
            else {
                console.log(result._id);
                res.json(result._id);
            }
        });
    })
}