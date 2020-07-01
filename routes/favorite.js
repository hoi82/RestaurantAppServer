module.exports = (app = require("express")()) => {
    const User = require("../models/user"); 
    const Restaurants = require("../models/restaurant").Restaurant;

    //Check Restaurant is favorite
    app.get("/api/favorite/restaurant/:id", (req, res, next) => {
        User.findById(req.session.user.id, (err, user) => {
            if (err) {

            }
            else {                
                res.json(user.favorite.filter((fav, i) => fav.equals(req.params.id)).length > 0);
            }
        })
    });

    //Add Favorite
    app.post("/api/favorite/restaurant", (req, res, next) => {
        if (req.session.user) {
            User.findById(req.session.user.id, (err, user) => {
                if (err) {
                    next(401, err);
                }
                else {
                    if (user.favorite.filter((fav, i) => fav.equals(req.body.resid)).length > 0) {
                        next({code: 403, message: "This restaurant is already added."});
                    }
                    else {
                        Restaurants.findById(req.body.resid, (err, restaurant) => {
                            if (err) {

                            }
                            else {
                                user.favorite.push(req.body.resid);                                
                                user.save((err, u) => {
                                    if (err) {                                        
                                        next({code: 402, message: "An Error is occured in saving."})
                                    } 
                                    else {
                                        res.json({
                                            id: restaurant._id,
                                            name: restaurant.name,
                                            address: restaurant.address,
                                            thumbnail: restaurant.thumbnail,
                                        });
                                    }
                                })
                            }
                        })                        
                    }
                }
            })
        }
        else {
            next(401, "You have to login first");
        }   
    });

    //Remove Favorite
    app.delete("/api/favorite/restaurant/:id", (req, res) => {                
        User.findByIdAndUpdate(req.session.user.id, {
            $pull: {
                favorite: req.params.id
            }
        }, (err, user) => {
            if (err) {                
                res.status(404).json(err);
            }
            else {
                res.json(user);
            }
        })
    });

    //Favorite Restaurant Thumbnails
    app.get("/api/favorite/restaurants", (req, res, next) => {
        if (req.session.user) {    
            User.findById(req.session.user.id).populate("favorite").exec((err, user) => {
                if (err) {
                    res.status(400).json(err.message);
                    return;
                }

                if (user) {
                    res.json(user.favorite.map((restaurant, i) => {
                        // id가 아니라 _id를 사용하고 있음
                        const test = {
                            id: restaurant._id,
                            name: restaurant.name,
                            address: restaurant.address,
                            thumbnail: restaurant.thumbnail,
                        }                    
                        return test;
                    }));
                }
                else {
                    req.json([]);
                }        
            });            
        }
        else {
            // next(401, "You have to login first");
            res.status(401).json("You have to login first");
        }
    });

    //edit 
    app.put("/api/favorite/restaurants", (req, res) => {
        if (req.session.user) {
            User.findById(req.session.user.id, (err, user) => {
                if (err) {
                    res.status(404).json();
                }
                else {                    
                    if (user) {
                        req.body.forEach(id => {                            
                            const index = user.favorite.findIndex((item) => item.equals(id));                            
                            //splice 시에 index가 0이면 리스트 전체를 수정함, 이때는 길이까지 지정해야될듯
                            if (index > -1)
                                user.favorite.splice(index, 1);                                
                        });                        
                        
                        user.save((err, user) => {
                            res.json(user.favorite);
                        })
                    }
                }
            })
        }
        else {
            res.status(401, "You have to login first");
        }
    })
}