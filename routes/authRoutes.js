//All the Authorization Routes are here
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

//Sign Up and Login System
router.post('/signup', authController.signup_post);
router.post('/login', authController.login_post);

module.exports = router;


