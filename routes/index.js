module.exports = (app, sessionStore) => {    
    const user = require("./user")(app, sessionStore);
    const search = require("./search")(app);
    const restaurant = require("./restaurant")(app);            
    const review = require("./review")(app); 
    const menu = require("./menu")(app);       
    const reservation = require("./reservation")(app);
    const favorite = require("./favorite")(app);
    const takeout = require("./takeout")(app);

    return app;
}