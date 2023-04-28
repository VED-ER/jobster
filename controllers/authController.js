const { StatusCodes } = require('http-status-codes');
const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const createJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    });
};

const register = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        throw new BadRequestError('Please provide password');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ ...req.body, password: hashedPassword });
    const token = createJWT({ userId: user._id, name: user.name });

    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = createJWT({ userId: user._id, name: user.name });
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
};

const updateUser = async (req, res) => {
    const { name, email, lastName, location } = req.body;

    if (!name || !email || !lastName || !location) {
        throw new BadRequestError('Please provide valid input');
    }

    const user = await userModel.findOneAndUpdate({ _id: req.user.userId }, req.body);

    const token = createJWT({ userId: user._id, name: user.name });
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
};

module.exports = {
    register,
    login,
    updateUser
};