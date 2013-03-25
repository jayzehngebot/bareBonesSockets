
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var moment = require('moment');


// the ExpressJS App
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);



// configuration of port, templates (/views), static files (/public)
// and other expressjs settings for the web server.
app.configure(function(){

  // server port number
  app.set('port', process.env.PORT || 5000);

  //  templates directory to 'views'
  app.set('views', __dirname + '/views');

  // setup template engine - we're using Hogan-Express
  app.set('view engine', 'html');
  app.set('layout','layout');
  app.engine('html', require('hogan-express')); // https://github.com/vol4ok/hogan-express

  app.use(express.favicon());
  // app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // database - skipping until week 5
  // app.db = mongoose.connect(process.env.MONGOLAB_URI);
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});




// ROUTES
var routes = require('./routes/index.js');
app.get('/', routes.index);


//All Socket Stuff Happens Here
// usernames which are currently connected to the chat
var usernames = {};
var userLoginTimes = {};
var countdown = 30;
var oldTime = moment().format('ss');
var currentTime = moment().format('ss');

io.sockets.on('connection', function (socket) {

    // when the client emits 'adduser', this listens and executes
      // we store the username in the socket session for this client
          // add the client's username to the global list
          // take note of the time
  socket.on('adduser', function(username){
    socket.username = username;
    usernames[username] = username;

    loginTime = moment().unix();

    userLoginTimes[loginTime] = loginTime;
    console.log(username + ' logged in at : ' + loginTime);

  // when the client emits 'sendchat', this listens and executes
      // we tell the client to execute 'updatechat' with 2 parameters
  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });




//if the difference between the currentTime and the OldTime is >= 1
// subtract 1 from the timer

    console.log('beginning timer');


  var t = setInterval(function(){

    var currentTime = moment().format('ss');
    // console.log('the old time  is : ' + oldTime);
    // console.log('the current second count is : ' + currentTime);
  if ((countdown > 0) && ((currentTime - oldTime) >= 1)){
  // console.log('subtracting 1 from the countdown');
  // console.log('countdown is : ' + countdown);
  countdown--;
  oldTime = currentTime;
  io.sockets.emit('updateClock', 'SERVER', countdown);
  } else if ((countdown > 0) && ((currentTime - oldTime) < 1)) {
    // console.log('not ready to countdown');
    //compensating for the fact that clock rolls at 60
    oldTime = currentTime;
    //socket.broadcast.emit('updateClock', 'SERVER', countdown);
  } else {
    currentTime = moment().format('ss');
  //  console.log('resetting countdown timer');
    countdown = 30 ;
  }
}, 1000);

    // echo to client they've connected
        // echo globally (all clients) that a person has connected
            // update the list of users in chat, client-side

    socket.emit('updatechat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
    io.sockets.emit('updateusers', usernames);
  });

  // when the user disconnects.. perform this
    // remove the username from global usernames list
        // update list of users in chat, client-side
            // echo globally that this client has left

  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});


//server.listen(process.env.PORT || 5000);
server.listen(5000);

    // http.createServer(app).listen(app.get('port'), function(){
    //   console.log("Express server listening on port " + app.get('port'));
    // });


// // ROUTES
// var routes = require('./routes/index.js');
// app.get('/', routes.index);



// // sockets
// io.sockets.on('connection', function (socket) {
// var d = new Date();
// var n = d.getDate();
//   socket.broadcast.emit('time', n);
//   });

// // create NodeJS HTTP server using 'app'





