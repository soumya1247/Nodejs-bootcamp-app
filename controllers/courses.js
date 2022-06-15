const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamps');

exports.getCouses = asyncHandler(async (req, res, next) => {
    // let query;

    if (req.params.bootcampId) {
        // query = Course.find({ bootcamp: req.params.bootcampId });
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        // query = Course.find().populate({
        //     path: 'bootcamp',
        //     select: 'name description'
        // });

        res.status(200).json(res.advancedResults);
    }

    // const courses = await query;

    // res.status(200).json({
    //     success: true,
    //     count: courses.length,
    //     data: courses
    // })
});

exports.getCouse = asyncHandler(async (req, res, next) => {



    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    })
});

exports.addCouse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Course with id of ${req.params.bootcampId}`), 404);
    }

    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
});

exports.updateCouse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`), 404);
    }

    //Make sure user is Course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course ${course._id}`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    })
});

exports.deleteCouse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id of ${req.params.id}`), 404);
    }

    //Make sure user is Course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course ${course._id}`, 401));
    }


    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
});