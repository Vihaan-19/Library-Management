const mongoose = require('mongoose');
const Book = require('../models/Book');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 25,
        default: null
    },
    password: {
        type: String,
        required: true,
        min: 4,
        default: null
    },
    isAdmin: {
        type: Boolean,
        required:true,
        default: 0
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    issuedBookCount:{
        type:Number,
        default:0
    },
    fine:{
        type:Number,
        default:0
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);