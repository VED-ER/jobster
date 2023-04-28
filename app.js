require('dotenv').config();
require('express-async-errors');

const path = require('path');
const express = require('express');
const notFoundMiddleware = require('./middleware/not-found');
const authRouter = require('./routes/authRoute');
const connectDB = require('./db/connectDB');
const errorHandlerMiddleware = require('./middleware/error-handler');
const jobsRouter = require('./routes/jobsRoute');
const authenticateUser = require('./middleware/authenticateUser');
const helmet = require('helmet');
const xss = require('xss-clean');

const port = process.env.PORT || 3000;
const app = express();

app.set('trust proxy', 1);

app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(express.json());
app.use(helmet());
app.use(xss());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log('listening on port ', port);
        });
    } catch (error) {
        console.log(error);
    }
};

start();