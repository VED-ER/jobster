const mongoose = require('mongoose');
const { BadRequestError, NotFoundError } = require("../errors");
const jobModel = require("../models/jobModel");
const { StatusCodes } = require('http-status-codes');
const moment = require('moment');

const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const job = await jobModel.create(req.body);
    res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
    const jobId = req.params.id;
    const { company, position } = req.body;

    if (!company || !position) {
        throw new BadRequestError('Company and position values can not be empty');
    }


    const job = await jobModel.findOneAndUpdate({ _id: jobId, createdBy: req.user.userId }, req.body, {
        new: true,
        runValidators: true
    });

    if (!job) {
        throw new NotFoundError('No job with id '.concat(jobId));
    }

    res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
    const jobId = req.params.id;

    const job = await jobModel.findOneAndDelete({ _id: jobId, createdBy: req.user.userId });

    if (!job) {
        throw new NotFoundError('No job with id '.concat(jobId));
    }

    res.status(StatusCodes.OK).send();
};

const getJob = async (req, res) => {
    const jobId = req.body.id;

    const job = await jobModel.findOne({ _id: jobId, createdBy: req.user.userId });

    if (!job) {
        throw new NotFoundError('No job with id '.concat(jobId));
    }

    res.status(StatusCodes.OK).json({ job });
};

const getAllJobs = async (req, res) => {
    const { status, jobType, sort, search } = req.query;

    const query = {
        createdBy: req.user.userId
    };

    if (search) {
        query.position = { $regex: search, $options: 'i' };
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    if (jobType && jobType !== 'all') {
        query.jobType = jobType;
    }

    let result = jobModel.find(query);

    if (sort === 'latest') {
        result.sort('-createdAt');
    }
    if (sort === 'oldest') {
        result.sort('createdAt');
    }
    if (sort === 'a-z') {
        result.sort('position');
    }
    if (sort === 'z-a') {
        result.sort('-position');
    }

    const page = Number(req.params.page) || 1;
    const limit = Number(req.params.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    const jobs = await result;

    const totalJobs = await jobModel.countDocuments(query);

    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });

};

const showStats = async (req, res) => {
    let stats = await jobModel.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    stats = stats.reduce((prev, curr) => {
        const { _id: status, count } = curr;
        prev[status] = count;
        return prev;
    }, {});

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
    };

    let monthlyApplications = await jobModel.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 10 },
    ]);

    monthlyApplications = monthlyApplications
        .map((item) => {
            const {
                _id: { year, month },
                count,
            } = item;
            const date = moment()
                .month(month - 1)
                .year(year)
                .format('MMM Y');
            return { date, count };
        })
        .reverse();

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
    createJob,
    getAllJobs,
    updateJob,
    deleteJob,
    getJob,
    showStats
};