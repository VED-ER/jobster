const express = require('express');
const { createJob, getAllJobs, updateJob, deleteJob, getJob, showStats } = require('../controllers/jobsController');
const testUser = require('../middleware/testUser');

const jobsRouter = express.Router();

jobsRouter.route('/').post(testUser, createJob).get(getAllJobs);
jobsRouter.route('/stats').get(showStats);
jobsRouter.route('/:id').patch(testUser, updateJob).delete(testUser, deleteJob).get(getJob);

module.exports = jobsRouter;