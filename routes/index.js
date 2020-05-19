module.exports = (app, sessionStore) => {
    const User = require("../models/user");    
    const Location = require("../models/location");
    const Restaurants = require("../models/restaurant").Restaurant;
    const RestaurantNames = require("../models/restaurant").RestaurantNames;
    const Categories = require("../models/restaurant").Category;
    const Reviews = require("../models/review");  
    const Menu = require("../models/menu");  
    const fs = require("fs");

    // const app = require("express")();
    //Get all users
    app.get("/api/users", (req, res) => {           
        User.find((err, users) => {
            if (err) {
                return res.status(500).send({ error: "db failure" });                
            }

            res.json(users);
        });        
    });
    
    //Login
    app.post("/api/users/login/", (req, res) => {                
        //NOTE:여기에서 헤더 설정하면 preflight error 발생                   
        User.findOne({ email: req.body.email, password: req.body.password }, (err, user) => {
            if (err) {
                return res.status(500).json({ email: req.body.email, error: err });
            }
            
            if (!user) {
                return res.json({ email: req.body.email, error: "user not found" });
            }

            let session = req.session;
            session.user = {
                email: user.email,
                name: user.name,
                lastAccess: Date.now
            };
                        
            res.json(session.user); 
        });             
    }); 
    
    app.post("/api/users/logout", (req, res) => {          
        if (req.session.user) {
            req.session.destroy((err) => {
                if (err) {
                    return res.json({session: false, error: err});
                }
                else {
                    return res.json({session: false});
                }                
            });                        
        }
        else {
            res.json({ session: false });
        }
    })
    
    //Get Session
    app.get("/api/users/session", (req, res) => {        
        if (req.session.user == undefined) {
            res.json({ session: false });
        }
        else {
            req.session.user.lastAccess = (new Date()).toUTCString();
            res.json({ session: true, email: req.session.user.email, name: req.session.user.name });
        }
    });

    //Get user by email
    app.get("/api/users/email/:email", (req, res) => {
        User.findOne({ email: req.params.email }, { _id: 0, name: 1 }, (err, user) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            if (!user) {
                return res.status(404).json({ error: "user not found" });
            }

            res.json(user);
        })
    });

    //Get user by name
    app.get("/api/users/name/:name", (req, res) => {
        User.findOne({ name: req.params.name }, { _id: 0, email: 1 }, (err, user) => {            
            if (err) {
                return res.status(500).json({ error: err });
            }

            if (!user) {
                return res.status(404).json({ error: "user not found" });
            }

            res.json(user);
        })
    });

    //Get User Name
    app.get("/api/user/:id/name", (req, res) => {
        User.findById(req.params.id).distinct("name", (err, name) => {
            res.json(name);
        })
    })

    //Create user
    app.post("/api/users", (req, res) => {          
        let user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.name = req.body.name;
        user.contact = req.body.contact;
        user.address = req.body.address;
        user.payments = req.body.payments;
        
        user.save((err) => {
            if (err) {                
                res.json({ success: false, message: err.code });
            }
            else {
                res.json({ success: true });
            }            
        });     
    });

    //Update user
    app.put("/api/users/:user_id", (req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err) {
                return res.status(500).json({ error: "db failed" });
            }

            if (!user) {
                return res.status(404).json({ error: "user not found" });
            }

            if (req.body.password) user.password = req.body.password;
            if (req.body.name) user.name = req.body.name;
            if (req.body.contact) user.contact = req.body.contact;
            if (req.body.address) user.address = req.body.address;
            if (req.body.payments) user.payments = req.body.payments;
            
            user.save((err) => {
                if (err) return res.status(500).json({error: "failed to update"});
                res.json({ message: "user updated" });
            })
        })
    });

    //Delete
    app.delete("/api/users/:email/:password", (req, res) => {
        res.end();
    });    

    //Get All Locations
    app.get("/api/locations", (req, res) => {
        Location.find((err, locations) => {
            res.json(locations);
        })
    });

    //Get All Restaurants
    app.get("/api/restaurants", (req, res) => {
        Restaurants.find((err, restaurants) => {
            res.json(restaurants);
        })
    });

    //Get All Restaurant Names
    app.get("/api/filter/names", (req, res) => {
        const maxCount = parseInt(req.query.maxCount) || 0;
        RestaurantNames.find().where("name").regex(new RegExp(req.query.name, "gi")).limit(maxCount).distinct("name", (err, names) => {            
            res.json(names);
        });    
    });

    //Get All Categories
    app.get("/api/filter/categories", (req, res) => {
        Categories.find({}, "-_id", (err, categories) => {
            res.json(categories);
        });
    });

    //Get All Countries
    app.get("/api/filter/countries", (req, res) => {        
        Location.find().distinct("name", (err, countries) => {            
            res.json(countries.filter((country) => country.toLowerCase().indexOf(req.query.name.toLowerCase()) > -1));
        })  
    });

    app.get("/api/filter/states", (req, res) => {        
        Location.findOne().where("name").equals(req.query.country).then((country) => {                        
            res.json(country.states);
        })
    });

    app.get("/api/search/name/:name", (req, res) => {        
        Restaurants.find({name: { $regex: `${req.params.name}`, $options: "gi" }}, (err, restaurants) => {
            res.json(restaurants);
        })
    });

    app.get("/api/search/category/:category", (req, res) => {
        Restaurants.find({category: req.params.category}, (err, restaurants) => {
            res.json(restaurants);
        })
    });

    app.get("/api/search/location", (req, res) => {
        let filter = {};
        if (req.query.country) {
            Object.assign(filter, { "address.country" : req.query.country });
        }

        if (req.query.state) {
            Object.assign(filter, { "address.state" : req.query.state });
        }

        Restaurants.find(filter, (err, restaurants) => {            
            res.json(restaurants);
        })        
    });

    //Get Restaurant by ID
    app.get("/api/restaurant/:id", (req, res) => {
        Restaurants.findById(req.params.id, (err, restaurant) => {
            res.json(restaurant);
        });
    });

    //Get Reviews by restaurant ID
    app.get("/api/restaurant/:id/reviews", (req, res) => {
        Reviews.find({ resID: req.params.id }, (err, reviews) => {
            res.json(reviews);
        });
    });

    //Get Menu by ID
    app.get("/api/menu/:id", (req, res) => {
        Menu.findById(req.params.id, (err, menu) => {            
            res.json(menu);
        })
    });
    
    app.get("/public/image/:name", (req, res) => {
        const src = fs.createReadStream();
        src.pipe(res);
    })
}