const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 25,
        default: null
    },
    author: {
        type: String,
        required: true,
        min: 4,
        default: null
    },
    
    customId:{
        type:String,
        unique:true,
        required:true,
    },

    issueStatus:{
        type:String,
        required:true,
        default:"Not Issued"
    },

    studentId:{
        type:String,
        default:null
    },
    dueDate:{
        type:String,
    },
    fine:{
        type:Number,
        default:5,
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);