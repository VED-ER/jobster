const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide valid name'],
        maxlength: 30,
        minlength: 3,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide valid email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email',
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
    lastName: {
        type: String,
        trim: true,
        minlength: 5,
        default: 'last name'
    },
    location: {
        type: String,
        trim: true,
        minlength: 3,
        default: 'my location'
    }
});

module.exports = mongoose.model('User', userSchema);