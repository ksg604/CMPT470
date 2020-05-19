const express = require('express');
const mysql = require('mysql2');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require("body-parser");
const session = require('express-session');
const fileupload = require('express-fileupload');
const fs = require('fs');
const md5 = require('md5');

//Database configuration
//Reference: https://riptutorial.com/node-js/example/29792/export-connection-pool
const pool = mysql.createPool({
    connectionLimit : 10,
    host: '35.227.146.173',
    database: 'cmpt470',
    user: 'readonlyuser',
    password: 'readonly'
})

module.exports = {
    getConnection: (callback) => {
        return pool.getConnection(callback);
    }
}


app.use(session({
    secret: 'cmpt470',
    resave: true,
    saveUninitialized: true
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(expressLayouts)
//app.use(express.static('public'))

app.use('/static', express.static('public'));

app.use(fileupload());


//directory of views 
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

//Routes
app.use('/', require('./routes/login.js'));
app.use('/landing-page', require('./routes/landing-page.js'));
app.use('/landing-page/histogram-generator', require('./routes/histogram-generator.js'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log("Server initialized on PORT:"+PORT));



