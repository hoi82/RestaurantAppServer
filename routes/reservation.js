const moment = require("moment");
const moment_timezone = require("moment-timezone");

module.exports = (app = require("express")()) => {
    const Restaurants = require("../models/restaurant").Restaurant; 
    const Reservations = require("../models/reservation");  
    const Users = require("../models/user"); 

    //Get Reservations by Restaurant ID and Date
    app.get("/api/reservation/:id/:year/:month/:day", (req, res, next) => {
        const reservationInfo = {};                
        Restaurants.findById(req.params.id, (err, restaurant) => {            
            if (err) {
                next(err);
            }

            const qStart = moment.tz(restaurant.opens.timezone).set({
                year: Number(req.params.year),
                month: Number(req.params.month - 1),
                date: Number(req.params.day),
                hour: 0, 
                minute: 0,
                second: 0,
                millisecond: 0
            });
            
            const qEnd = qStart.clone().set({hour:24});                            
            reservationInfo.cancellation = restaurant.reservation;                
            Reservations.find({
                deleted: false, 
                time: { $gte: qStart.utc().toDate(), $lte: qEnd.utc().toDate() },
                resid: restaurant._id}, (err, reservations) => {                    
                    if (err) {
                        return next(err);
                    }                                        
                    
                    res.json({                                                
                        available: restaurant.opens.time[qStart.day()].map((item) => ({
                            start: moment.tz(restaurant.opens.timezone).set({
                                year: Number(req.params.year),
                                month: Number(req.params.month - 1),
                                date: Number(req.params.day),
                                hour: item.open.hour, 
                                minute: item.open.minute,
                                second: 0,
                                millisecond: 0
                            }),
                            end: moment.tz(restaurant.opens.timezone).set({
                                year: Number(req.params.year),
                                month: Number(req.params.month - 1),
                                date: Number(req.params.day),
                                hour: item.close.hour, 
                                minute: item.close.minute,
                                second: 0,
                                millisecond: 0
                            })
                        })),
                        reservations: reservations
                    });
                }
            )                       
        })        
    });

    //Add Reservation
    app.post("/api/reservation", (req, res, next) => {        
        const reservation = new Reservations();
        reservation.resid = req.body.resid;
        reservation.userid = req.body.userid;
        reservation.time = req.body.time;  
        reservation.name = req.body.name;      
        reservation.timezone = req.body.timezone;
        reservation.member = req.body.member;
        reservation.message = req.body.message;
        reservation.created = new Date();
        reservation.edited = new Date();
        reservation.deleted = false;
        reservation.save({validateBeforeSave: true}, (err, p) => {
            if (err) {                             
                return next(err);
            }

            res.json(p._id);            
        })
    });

    //Get Single Reservation
    app.get("/api/reservation/:id", (req, res, next) => {        
        Reservations.findOne({_id: req.params.id, deleted: false} ,"time name member message resid" ,(err, reservation) => {
            if (err) {
                return next(err);
            }

            if (!reservation) {
                return next("NOT_FOUND");
            }
            
            Restaurants.findById(reservation.resid, "name address", (err, restaurant) => {
                if (err) {
                    return next(err);
                }                
                
                if (restaurant) {
                    const result = {
                        time: reservation.time,  
                        username: reservation.name,                      
                        member: reservation.member,
                        message: reservation.message,
                        resname: restaurant.name,
                        resaddress: restaurant.address,
                        resid: restaurant._id
                    };
                    
                    res.json(result);
                }
                else {
                    return next({code: "NOT_FOUND"})
                }
            })
        })
    });

    //Get Reservations by id
    app.get("/api/reservations/:id", (req, res, next) => {        
        Reservations.find({userid: req.params.id, deleted: false}, (err, reservations) => {
            if (err) {
                next(err);
            }
            
            res.json(reservations);
        });
    })
}