const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

router.use(express.json());
dotenv.config();

const signup_post = async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;

        if (!username || !password || isAdmin === undefined)
            return res.status(400).send('All fields are required');

        const hashedPassword = await bcrypt.hash(password, 10);
        if (isAdmin) {
            const newAdmin = await Admin.create({
                username,
                password: hashedPassword, 
                isAdmin,
            });
            const token = jwt.sign({ id: newAdmin._id }, process.env.secret_key, { expiresIn: '2h' });
            newAdmin.token = token;
            newAdmin.password = null;

            res.status(200).json(newAdmin);
        } else {
            const newUser = await User.create({
                username,
                password: hashedPassword,
                isAdmin,
            });

            const token = jwt.sign({ id: newUser._id }, process.env.secret_key, { expiresIn: '2h' });
            newUser.token = token;
            newUser.password = null;

            res.status(200).json(newUser);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const login_post = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).send('All fields required');

        const loggedInUser = await User.findOne({ username });
        if (loggedInUser) {
            const isPasswordValid = await bcrypt.compare(password, loggedInUser.password);

            if (isPasswordValid) {
                const token = jwt.sign({ id: loggedInUser._id }, process.env.secret_key);
                loggedInUser.token = token;
                loggedInUser.password = null;
                res.status(200).json({ user: loggedInUser, token });
            } else {
                res.status(401).send('Wrong Password');
            }
        } else {
            res.status(401).send('Please Sign Up first');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { signup_post, login_post };
