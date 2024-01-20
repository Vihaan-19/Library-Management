const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");
const Admin = require("../models/Admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
        return res.status(401).send("Invalid Authorization");

    try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.secret_key);
        req.userId = payload.id;
        next();
    } catch (err) {
        res.status(403).send(err);
    }
}

const isAdmin = async (req, res, next) => {
    try {
        let user = await Admin.findOne({ _id: req.userId });

        if (!user) {
            user = await User.findOne({ _id: req.userId });

            if (!user) {
                return res.status(404).send('User Not Found');
            } else if (!user.isAdmin) {
                return res.status(400).send('You are not an admin');
            }
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

router.post('/add', auth, isAdmin, adminController.addBook);
router.post('/update/:bookId', auth, isAdmin, adminController.updateBook);
router.get('/view/:userId', auth, isAdmin, adminController.viewUserBooks);
router.delete('/delete/:bookId', auth, isAdmin, adminController.deleteBook);

module.exports = router;
