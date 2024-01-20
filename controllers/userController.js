const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const dotenv = require("dotenv");

router.use(express.json());
dotenv.config();

const issue = async (req, res) => {
    try {
        const user = await User.findOne({ customId: req.params.userId });

        if (!user) {
            return res.status(404).json({ error: 'User Not Found' });
        }

        if (user.issuedBooksCount >= 4) {
            return res.status(400).json({ error: 'User has reached the limit of issued books' });
        }

        const book = await Book.findOne({ _id: req.params.bookId });

        if (!book || book.issueStatus === 'Issued') {
            return res.status(400).json({ error: 'Book is not available for issue' });
        }

        const currentDate = new Date();
        const dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + 15); // Due date is set to 15 days from the issue date

        user.books.push({
            book: req.params.bookId,
            issueDate: currentDate,
            dueDate: dueDate,
        });

        user.issuedBooksCount += 1;

        book.issueStatus = "Issued";
        await Promise.all([user.save(), book.save()]);

        res.status(200).json({
            issueStatus: 'Issued',
            studentId: user.customId,
            dueDate: dueDate,
            fine: 0, // Fine is initially set to 0
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

const available = async (req, res) => {
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

        user.books.splice(issuedBookIndex, 1); // Remove the book from user's issued books
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
};

const viewBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.bookId });

        if (!book) {
            return res.status(404).json({ error: 'Book Not Found' });
        }

        res.status(200).json(book);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

const calculateFine = (currentDate, dueDate) => {
    const timeDifference = currentDate.getTime() - dueDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const daysAfterDueDate = Math.max(0, daysDifference - 15); // Fine is applicable after 15 days

    const fine = daysAfterDueDate * 5; // Rs.5 per day as per the requirement
    return fine;
};

module.exports = { issue, available, viewBook };
