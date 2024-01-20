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
            const toUpdateBook = await Book.findOneAndUpdate(req.params.bookId, { name, author });
            res.status(200).json(toUpdateBook);
        }

        catch (err) {
            console.log(err);
        }
    }

const calculateFine = (currentDate, dueDate) => {
    const timeDifference = currentDate.getTime() - dueDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const daysAfterDueDate = Math.max(0, daysDifference - 15); // Fine is applicable after 15 days

    const fine = daysAfterDueDate * 5; // Rs.5 per day as per the requirement
    return fine;
};

const returnBook =
    async (req, res) => {
        try {
            const book = await Book.findOne({ _id: req.params.bookId });

            if (!book || book.issueStatus === 'Available') {
                return res.status(400).json({ error: 'Book is not issued or not found' });
            }

            const user = await User.findOne({ customId: req.params.userId });

            if (!user) {
                return res.status(404).json({ error: 'User Not Found' });
            }

            const issuedBookIndex = user.books.findIndex(bookInfo => bookInfo.book.toString() === req.params.bookId);

            if (issuedBookIndex === -1) {
                return res.status(400).json({ error: 'Book not found in user\'s issued books' });
            }

            const issuedBookInfo = user.books[issuedBookIndex];

            const currentDate = new Date();
            const fine = calculateFine(currentDate, issuedBookInfo.dueDate);

            user.books.splice(issuedBookIndex, 1);
            user.issuedBooksCount -= 1;

            book.issueStatus = "Available";
            await Promise.all([user.save(), book.save()]);

            res.status(200).json({
                issueStatus: 'Available',
                studentId: user.customId,
                dueDate: issuedBookInfo.dueDate,
                fine: fine,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
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
            else
                return res.status(200).json(user.books);
        }

        catch (err) {
            console.log(err);
        }
    }

const viewBook =
    async (req, res) => {
        try {
            const book = await Book.findOne({_id:req.params.bookId});
            console.log(req.params.bookId);
            if (book)
                return res.status(200).json(book);
            else
                return res.status(400).json('Book not found');
        }

        catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

const deleteBook =
    async (req, res) => {
        try {
            await Book.findByIdAndDelete({ customId: req.params.bookId });
            res.status(200).json("Book has been deleted");
        }

        catch (err) {
            console.log(err);
        }
    }

module.exports = { addBook, updateBook, returnBook, viewUserBooks, viewBook, deleteBook };




