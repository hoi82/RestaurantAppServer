require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
var session = require("express-session");
var mongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3005;

const corsOption = {
    origin: true,
    credentials: true
}

var sessionstore = new mongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
}, (err) => console.log("error : " + err));

app.use(morgan("dev"));

app.use(cors(corsOption));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(cookieParser());
app.use(session({    
    secret: "yhrox",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    store: sessionstore
}));

// app.use([], session({
//     secret: "blahblahbl",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 10
//     },
//     store: sessionstore
// }))

app.use("/static", express.static(path.resolve(__dirname, "public")));

mongoose.plugin(require("mongoose-id"));
var router = require("./routes")(app);

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => console.log("db connected")
).catch((e) => console.error(e));

app.use((error, req, res, next) => {    
    res.status(error.code).json(error.message);
});

var server = app.listen(port, () => console.log(`Server is running on port ${port}`));