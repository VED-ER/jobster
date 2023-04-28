const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    const error = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong, please try again later"
    };

    if (err.statusCode) {
        error.statusCode = err.statusCode;
        error.message = err.message;
    }

    res.status(error.statusCode).json({ msg: error.message });
};

module.exports = errorHandlerMiddleware;