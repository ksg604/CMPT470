/*
if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}*/

//Entry point

const express = require('express');
const mysql = require('mysql');
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require("body-parser")
const path = require('path');
var cors = require('cors');
require('dotenv').config({path:path.join(__dirname,'.env')});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(cors());






// Create connection

/*
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Taguig050396!',
    database: 'nodemysql'
});

db.connect((err) => {
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log('MySql Connected');
    }
})*/


//const app = express();



/*
const mongoose = require('mongoose')
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
const dbC = mongoose.connection
dbC.on('error', error => console.error(error))
dbC.once('error', error => console.log('Connected to Mongoose'))
*/
app.use('/', indexRouter)


app.listen('8080', () => {
    console.log('Server started on port 8080');
})

//app.listen('4000', '0.0.0.0');
//app.listen(process.env.PORT || 3000)