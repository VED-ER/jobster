const express = require('express');
const { login, register, updateUser } = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');
const testUser = require('../middleware/testUser');

const authRouter = express.Router();

const rateLimiter = require('express-rate-limit');
const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        msg: 'Too many requests from this IP, please try again after 15 minutes',
    }
});

authRouter.route('/login').post(apiLimiter, login);
authRouter.route('/register').post(apiLimiter, register);
authRouter.route('/updateUser').patch(authenticateUser, testUser, updateUser);


module.exports = authRouter;