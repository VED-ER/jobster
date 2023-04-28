require('dotenv').config();

const mockData = require('./MOCK_DATA.json');
const connectDB = require('./db/connectDB');
const jobModel = require('./models/jobModel');


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        await jobModel.create(mockData);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

start();