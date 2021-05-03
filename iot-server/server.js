const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

// connect db
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('Db connected'));

// initialize server 
const app = express();
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(process.env.PORT);
const io = socketio(expressServer, {
    path: '/socket.io',
    serveClient: true,
});

// middleware
app.use(express.json());
io.of('/').on('connect', (socket) => {
    socket.emit('dataFromServer', {msg: 'Connected'})
    app.use('/user', [socketMiddleware(socket), require('./routes/user')])
})

// socket 

const socketMiddleware = (socket) => ((req, res, next) => {
    // console.log(socket);
    console.log('abc');
    // console.log(socket);
    socket.broadcast.emit('dataFromServer', { msg: 'POOP' })
    req.socket = socket;
    next();
})

