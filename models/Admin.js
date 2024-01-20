const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
        default: 1
    },
    token:{
        type:String,
        default:null
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);