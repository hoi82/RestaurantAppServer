module.exports = (app = require("express")(), sessionStore = require("connect-mongodb-session")()) => {
    const User = require("../models/user");   

    //Get all users
    app.get("/api/users", (req, res, next) => {           
        User.find((err, users) => {
            if (err) {                
                next(err);
            }            

            res.json(users);
        });        
    });

    //Login
    app.post("/api/users/login/", (req, res, next) => {                                         
        User.findOne({ email: req.body.email }, (err, user) => {
            if (err) {
                next(err);
            }            
            
            if (!user) {
                next({code: "NO_USER"});
            }
            else {
                if (user.password == req.body.password) {
                    let session = req.session;            
                    session.user = {
                        sid: req.sessionID,
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastAccess: new Date()
                    };                                                      
                    res.json(session.user); 
                }
                else {
                    next({code: "WRONG_PASSWORD"})
                }                
            }            
        });             
    });
    
    //LogOut
    app.get("/api/users/logout", (req, res) => {        
        if (req.session.user) {            
            sessionStore.destroy(req.session.user.sid);
        }
        res.json();
    });

    //Session check
    app.get("/api/users/session", (req, res) => {                   
        if (req.session.user == undefined) {
            res.json({ session: false });
        }
        else {
            req.session.user.lastAccess = (new Date()).toUTCString();
            res.json({ session: true, id: req.session.user.id, email: req.session.user.email, name: req.session.user.name, lastAccess: new Date() });
        }
    });

    //Get user by email
    app.get("/api/users/email/:email", (req, res) => {
        User.findOne({ email: req.params.email }, { _id: 0, name: 1 }, (err, user) => {
            if (err) {
                return next(err);                
            }

            if (!user) {
                return next({code: "NO_USER"});                
            }

            res.json(user);
        })
    });

    //Get user by name
    app.get("/api/users/name/:name", (req, res) => {
        User.findOne({ name: req.params.name }, { _id: 0, email: 1 }, (err, user) => {            
            if (err) {
                return next(err);                
            }

            if (!user) {
                return next({code: "NO_USER"});                
            }

            res.json(user);
        })
    });

    //Get User Name
    app.get("/api/user/:id/name", (req, res, next) => {
        User.findById(req.params.id).distinct("name", (err, name) => {
            if (err) {
                next(err);
            }

            res.json(name);
        })
    })

    //Create user
    app.post("/api/users", (req, res, next) => {          
        let user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.name = req.body.name;
        user.contact = req.body.contact;
        user.address = req.body.address;
        user.payments = req.body.payments;
        
        user.save((err) => {
            if (err) {                
                next(err);
            }
            else {
                res.json();
            }            
        });     
    });

    //Update user
    app.put("/api/users/:user_id", (req, res, next) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err) {                
                next(err);
            }

            if (!user) {
                next({code: "NO_USER"});
            }

            if (req.body.password) user.password = req.body.password;
            if (req.body.name) user.name = req.body.name;
            if (req.body.contact) user.contact = req.body.contact;
            if (req.body.address) user.address = req.body.address;
            if (req.body.payments) user.payments = req.body.payments;
            
            user.save((err) => {
                if (err) next(err);
                res.json({ message: "user updated" });
            })
        })
    });

    //Delete
    app.delete("/api/users/:email/:password", (req, res) => {
        res.end();
    });    
}