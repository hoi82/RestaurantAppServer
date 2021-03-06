module.exports = (app = require("express")()) => {
    const Reviews = require("../models/review");  
    const Users = require("../models/user");

    const getReviewRatings = (id) => {
        return new Promise((resolve, reject) => {
            Reviews.find({ resID: id, deleted: false }, (err, res) => {
                if (err) {
                    reject(err);
                }
                const sum = res.reduce((acc, cur, i) => (
                    acc + cur.rating
                ), 0);
                const len = res.length;
                resolve({sum: sum, len: len});
            });
        })        
    };

    const getReviewsAndRatingByRestaurant = (req, res, next) => {
        Reviews.find({ resID: req.params.id, deleted: false }, [], {
            skip: Number(req.query.page) * Number(req.query.len),
            limit: Number(req.query.len),
            sort: "-created"            
        }, (err, reviews) => {
            if (err) {
                return next(err);
            }
            
            const promises = reviews.map((r, i) => (r.toObject())).map((r, i) => {
                return new Promise((resolve, reject) => {
                    Users.findById(r.userID, (err, user) => {
                        if (err) {
                            reject(err);
                        }
                        
                        if (user) {
                            r.userName = user.name;
                        }

                        resolve(r);
                    })
                })
            });

            Promise.all(promises).then((results) => {                
                getReviewRatings(req.params.id).then((rating) => {
                    res.json({
                        totalReviews: rating.len,
                        reviewRating: rating.sum == 0 && rating.len == 0 ? "?" : (rating.sum / rating.len).toFixed(1),
                        reviews: results
                    });
                });                
            }).catch((err) => {
                return next(err);
            });
        })   
    }

    //Get Reviews by restaurant ID (Include Reviewer Name)
    app.get("/api/restaurant/:id/reviews", (req, res, next) => {        
        getReviewsAndRatingByRestaurant(req, res, next);
    });

    //Add Review
    app.post("/api/review", (req, res, next) => {        
        const review = new Reviews();
        review.resID = req.body.resid;
        review.userID = req.session.user.id;
        review.rating = req.body.rating;
        review.title = req.body.title;
        review.comment = req.body.comment;
        review.created = new Date();
        review.edited = new Date();
        review.deleted = false;
        review.save({validateBeforeSave: true}, (err, rv) => {
            if (err) {
                return next(err);  
            }
            else {                
                res.json(rv);
            }
        })        
    });

    //Edit Review
    app.put("/api/review/:id", (req, res, next) => {        
        const edit = Object.assign({}, req.body, {edited: new Date()});
        Reviews.findByIdAndUpdate(req.params.id, edit, (err, rev) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(rev);
            }            
        });
    });

    //Delete Review
    app.delete("/api/review/:id", (req, res, next) => {                
        Reviews.findByIdAndUpdate(req.params.id, {deleted: true}, (err, rev) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(rev);                
            }
        })
    });

    //Get Single Review
    app.get("/api/review/:id", (req, res, next) => {
        Reviews.findById(req.params.id, (err, rev) => {
            if (err) {
                return next(err);
            }
            else {
                res.json(rev);
            }
        })
    })
}