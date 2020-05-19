const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
//Database configuration
const db = require('./config/keys').MongoURI;

var server = require('https').Server({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'testphrase'
},app);
var io = require('socket.io')(server);

mongoose.connect(db,{ useNewUrlParser: true })
  .then(() => {
  console.log('Database Connected');
  })
  .catch(err => {
    console.log(err);
  });


const messages = require('./models/messages');
const ChatMessage = messages.ChatMessage;
const MessageHistory = messages.MessageHistory;
//Middleware

// parse application/json
app.use(express.urlencoded({extended:false}));


app.use(bodyParser.json());
//setting the view engine to be ejs
app.use(expressLayouts);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'cmpt470rocks',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 300000}
}));

io.on("connection", socket => {
  console.log("user connected");

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("sendMessage", function(msg, name, roomName) {
    console.log("message: " + msg + " from: " + name + " in room:" + roomName);

    //broadcast message to everyone in port:5000 except yourself.
    // socket.broadcast.emit("receiveMessage", { message: msg, senderName: name });
    let  chatMessage  =  new ChatMessage({ senderName: name, msg: msg});
    const filter = {roomName: roomName};
    const update = { $push: { messages: chatMessage } };

    MessageHistory.findOneAndUpdate(filter, update, {
      upsert: true
    },  function(err, numberAffected, rawResponse) {
    console.log(numberAffected)
    });

    socket.to(roomName).emit("receiveMessage", { message: msg, senderName: name });
  });

  socket.on("joinRoom", function(name, roomName){
    socket.join(roomName);
    console.log(name + " joined room: " + roomName);

    const filter = {roomName: roomName};
    MessageHistory.findOne(filter, function (err, obj) {

      if (obj != null) {
        io.to(socket.id).emit('updateMessages', obj.messages);
      } else {
        io.to(socket.id).emit('updateMessages', []);
      }
    });


  });
  socket.on("leaveRoom", function(name, roomName){
    socket.leave(roomName);
    console.log(name + " left room: " + roomName);

  });

  socket.on("clearMessages", function (roomName) {
    socket.to(roomName).emit("clearMessages");
  })
});
app.use('/static', express.static('public'));



//directory of views
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

//Routes for home
app.use('/', require('./routes/home.js'));
//Routes for user
app.use('/user', require('./routes/user.js'));
//Routes for business
app.use('/business', require('./routes/business.js'));
//Routes for api
app.use('/api', require('./routes/api.js'));


const PORT = process.env.PORT || 443;

server.listen(PORT, console.log("Server initialized on PORT:"+PORT));
