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
                const qStart = new Date(req.params.year, req.params.month, req.params.day);
                const qEnd = new Date(req.params.year, req.params.month, req.params.day + 1);
                const schedule = restaurant.opens.time[qStart.getDay()];
                reservationInfo.cancellation = restaurant.reservation;
                
                Reservations.find({
                    deleted: false, 
                    start: { $gte: qStart, $lte: qEnd },
                    resid: restaurant._id}, (err, reservations) => {
                        if (err) {                            
                            res.status(404).json(err);
                            return;
                        }
                        else {                                                     
                            reservationInfo.reserved = reservations;   
                            
                            if (schedule.length > 0) {
                                reservationInfo.open =  `${schedule[0].open[0]}:${schedule[0].open[1]} `;
                                reservationInfo.close = `${schedule[schedule.length - 1].close[0]}:${schedule[schedule.length - 1].close[1]}`;                                
                                if (schedule.length > 1) {
                                    if (!reservationInfo.reserved) {
                                        reservationInfo.reserved = [];
                                    }
                                    for (let i = 1; i < schedule.length; i++) {
                                        reservationInfo.reserved.push(
                                            {
                                                start: new Date(req.params.year, req.params.month, req.params.day, schedule[i-1].close[0], schedule[i-1].close[1]),
                                                end: new Date(req.params.year, req.params.month, req.params.day, schedule[i].open[0], schedule[i].open[1])
                                            }
                                        );                                        
                                    }
                                }
                            } else {
                                reservationInfo.open = "0:00";
                                reservationInfo.close = "24:00";
                                reservationInfo.reserved = [{start: "0:00", end: "24:00"}];
                            }
                                
                            res.json(reservationInfo);
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
                res.json(p);
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