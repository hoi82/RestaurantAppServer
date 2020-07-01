const moment = require("moment");
const moment_timezone = require("moment-timezone");

module.exports = (app = require("express")()) => {
    const Restaurants = require("../models/restaurant").Restaurant; 
    const Reservations = require("../models/reservation");   

    //Get Reservations by Restaurant ID and Date
    app.get("/api/reservation/:id/:year/:month/:day", (req, res) => {
        const reservationInfo = {};                
        Restaurants.findById(req.params.id, (err, restaurant) => {            
            if (err) {
                res.status(404).json(err);
                return;
            }
            else {                               
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
                    start: { $gte: qStart.utc().toDate(), $lte: qEnd.utc().toDate() },
                    resid: restaurant._id}, (err, reservations) => {                        
                        if (err) {
                            res.status(404).json(err);
                        }
                        else {                            
                            res.json(reservations);
                        }                                               
                    }
                )                                
            }            
        })        
    });

    //Add Reservation
    app.post("/api/reservation", (req, res) => {        
        const reservation = new Reservations();
        reservation.resid = req.body.resid;
        reservation.userid = req.body.userid;
        reservation.start = req.body.start;        
        reservation.end = req.body.end;
        reservation.timezone = req.body.timezone;
        reservation.member = req.body.member;
        reservation.message = req.body.message;
        reservation.created = new Date();
        reservation.edited = new Date();
        reservation.deleted = false;
        reservation.save({validateBeforeSave: true}, (err, p) => {
            if (err) {   
                console.log(err.stack);             
                res.json(err)
            }
            else {     
                res.json(p._id);
            }
        })
    });

    //Get Single Reservation
    app.get("/api/reservation/:id", (req, res) => {        
        Reservations.findOne({_id: req.params.id, deleted: false} ,"start end member message resid" ,(err, reservation) => {
            if (err) {

            }
            else {                
                Restaurants.findById(reservation.resid, "name address", (err, restaurant) => {
                    if (err) {

                    }
                    else {
                        if (restaurant) {
                            const result = {
                                start: reservation.start,
                                end: reservation.end,
                                member: reservation.member,
                                message: reservation.message,
                                resname: restaurant.name,
                                resaddress: restaurant.address
                            };
                            res.json(result);
                        }
                    }
                })                
            }
        })
    });

    //Get Reservations by id
    app.get("/api/reservations/:id", (req, res) => {        
        Reservations.find({userid: req.params.id, deleted: false}, (err, reservations) => {
            if (err) {

            }
            else {
                res.json(reservations);
            }
        });
    })
}