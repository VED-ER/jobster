const { UnauthenticatedError } = require("../errors");
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = payload;

        const testUser = userId === '644b8bb6909cae8524aa5ea8';
        req.user = { userId, testUser };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

module.exports = authenticateUser;