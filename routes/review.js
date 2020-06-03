module.exports = (app = require("express")()) => {
    const Reviews = require("../models/review");  

    //Get Reviews by restaurant ID
    app.get("/api/restaurant/:id/reviews", (req, res) => {
        Reviews.find({ resID: req.params.id, deleted: false }, (err, reviews) => {
            res.json(reviews);
        });
    });

    //Add Review
    app.post("/api/review", (req, res) => {
        const review = new Reviews();
        review.resID = req.body.resId;
        review.userID = req.session.user.id;
        review.rating = req.body.rating;
        review.title = req.body.title;
        review.comment = req.body.comment;
        review.created = new Date();
        review.edited = new Date();
        review.deleted = false;
        review.save({validateBeforeSave: true}, (err, rv) => {
            if (err) {
                res.json(err);
            }
            else {
                res.json(rv);
            }
        })        
    });

    //Edit Review
    app.patch("/api/review", (req, res) => {
        const edit = Object.assign({}, req.body, {edited: new Date()});
        Reviews.findByIdAndUpdate(req.body.id, edit, (err, rev) => {
            if (err) {
                res.status(404).json(err);
            }
            else {
                res.json(rev);
            }            
        });
    });

    //Delete Review
    app.delete("/api/review", (req, res) => {                
        Reviews.findByIdAndUpdate(req.body.id, {deleted: true}, (err, rev) => {
            if (err) {
                res.status(404).json(err);
            }
            else {
                res.json(rev);
            }
        })
    });
}