module.exports = (app = require("express")()) => {
    const Reviews = require("../models/review");  
    const Users = require("../models/user");

    const getReviewRatings = (id) => {
        return new Promise((resolve, reject) => {
            Reviews.find({ resID: id, deleted: false }, (err, res) => {
                const sum = res.reduce((acc, cur, i) => (
                    acc + cur.rating
                ), 0);
                const len = res.length;
                resolve({sum: sum, len: len});
            });
        })        
    }

    //Get Reviews by restaurant ID (Include Reviewer Name)
    app.get("/api/restaurant/:id/reviews", (req, res) => {        
        Reviews.find({ resID: req.params.id, deleted: false }).skip(Number(req.query.page) * Number(req.query.len))
        .limit(Number(req.query.len)).then((reviews) => {            
            const promises = reviews.map((r, i) => (r.toObject())).map((r, i) => {
                return new Promise((resolve, reject) => {
                    Users.findById(r.userID, (err, user) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            if (user) {
                                r.userName = user.name;
                            }

                            resolve(r);
                        }                        
                    })
                })
            });

            Promise.all(promises).then((results) => {
                getReviewRatings(req.params.id).then((rating) => {
                    res.json({
                        totalReviews: rating.len,
                        reviewRating: rating.sum == 0 && rating.len == 0 ? "?" : rating.sum / rating.len,
                        reviews: results
                    });
                });                
            });
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