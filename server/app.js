var path = require('path'); 
var express = require('express');
var app = express(); 
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socket = require('./socket.js');

var port = process.env.PORT || process.env.NODE_PORT || 3000;
server.listen(port);

app.use('/', express.static(path.resolve(__dirname, '../client/')));

socket.configureSockets(io);

console.log("Listening on port " + port);