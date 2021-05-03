const express = require('express');
const { isValidObjectId } = require('mongoose');
const User = require('../models/User');
const router = express.Router();


router.post('/add', async (req, res) => {
    const { name, position, plate, carType } = req.body;
    try {
        const newUser = await User.create({ name, position, car: { plate, carType }});
        res.status(201).json(newUser);
    } catch (error) {
        res.status(401).json(error);
    }
})

router.post('/info', async (req, res) => {
    const { number, type, time } = req.body;
    const user = await User.findOne({'car.plate': number}).exec();
    // console.log(user);
    const { socket } = req;
    // console.log(socket)
    try {
    // console.log('type', type);
    if(type === 'in') {
        user.car.sessions.push({
            checkIn: time,
        })          
        // console.log('1', user);
        const userCheckIn = await user.save(); 
        console.log('userCheckin');
        // console.log('2', userCheckIn);

        // console.log(socket)
        socket.broadcast.emit('dataFromServer', { data: userCheckIn });
            // Same ajax request nhưng thay vì qua http thì là qua sockets
            // cùng sd tcp/ip

        res.status(202).json(userCheckIn);
    }
    if(type === 'out') {
        user.car.sessions[user.car.sessions.length - 1].checkOut = time;
        const userCheckDone = await user.save(); 
        console.log('hello', userCheckDone);
        socket.broadcast.emit('dataFromServer', { data: userCheckDone });
        res.status(202).json(userCheckDone); 
    }   
    }     
    catch (error) {
         res.status(404).json(error);
    }
    

})


module.exports = router;