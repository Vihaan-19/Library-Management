const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const dotenv = require("dotenv");

router.use(express.json());
dotenv.config();

const addBook =
    async (req, res) => {
        try {
            const { name, author, customId, fine } = req.body;
            if (!name || !author || !customId)
                res.status(400).send('All fields are required');

            const checkExistingBook = await Book.findOne({ customId });

            if (checkExistingBook)
                res.status(400).send('Book Already Exists');

            var addedBook = await Book.create({
                name,
                author,
                customId,
                fine
            })
            res.status(200).json(addedBook);
        }

        catch (err) {
            console.log(err);
        }

    }
const updateBook =
    async (req, res) => {
        try {
            const { name, author } = req.body;
            const toUpdateBook = await User.findOneAndUpdate(req.params.bookId, { name, author });
            res.status(200).json(toUpdateBook);
        }

        catch (err) {
            console.log(err);
        }
    }

const viewUserBooks =
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId).populate('books');
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            if (!user.books)
                return res.status(200).json({ message: 'User has not issues any book' });
            res.status(200).json(user.books);
        }

        catch (err) {
            console.log(err);
        }
    }

const deleteBook =
    async (req, res) => {
        try {
            await User.findByIdAndDelete({ customId: req.params.bookId });
            res.status(200).json("Book has been deleted");
        }

        catch (err) {
            console.log(err);
        }
    }

module.exports = { addBook, updateBook, viewUserBooks, deleteBook };




