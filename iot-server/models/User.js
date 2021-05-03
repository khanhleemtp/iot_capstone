const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    position: {
        type: String,
    },
    car: {
        plate: {
            type: String,
            unique: true,
        },
        carType: {
            type: String
        },
        sessions: [
            {
                checkIn: {
                    type: Date,
                },
                checkOut: {
                    type: Date
                }
            } 
        ]
    },
})

const User = mongoose.model('users', userSchema);

module.exports = User;

