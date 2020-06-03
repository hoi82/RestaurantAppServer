module.exports = (app = require("express")()) => {
    const User = require("../models/user");   

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
        User.findOne({ email: req.body.email, password: req.body.password }, (err, user) => {
            if (err) {
                return res.status(500).json({ email: req.body.email, error: err });
            }
            
            if (!user) {
                return res.json({ email: req.body.email, error: "user not found" });
            }

            let session = req.session;            
            session.user = {
                id: user.id,
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
    });

    //Get Session
    app.get("/api/users/session", (req, res) => {        
        if (req.session.user == undefined) {
            res.json({ session: false });
        }
        else {
            req.session.user.lastAccess = (new Date()).toUTCString();
            res.json({ session: true, id: req.session.user.id, email: req.session.user.email, name: req.session.user.name });
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
}