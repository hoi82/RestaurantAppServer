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
        reservation.member = req.body.member;
        reservation.message = req.body.message;
        reservation.created = new Date();
        reservation.edited = new Date();
        reservation.deleted = false;
        reservation.save({validateBeforeSave: true}, (err, p) => {
            if (err) {                
                res.json(err)
            }
            else {     
                res.json(p._id);
            }
        })
    });

    //Get Reservations by userID
    app.get("/api/reservation/:id", (req, res) => {        
        Reservations.findById(req.params.id, (err, reservation) => {
            if (err) {

            }
            else {
                res.json(reservation);
            }
        })
    });
}