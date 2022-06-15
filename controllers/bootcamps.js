const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamps');

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    // try {
    //     const bootcamps = await Bootcamp.find();

    //     res.status(200).json({ success: true, msg: 'Get All Bootcamps', hello: req.hello });
    //     res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
    // } catch (err) {
    //     res.status(400).json({ success: false });
    //     next(err);
    // }
    // let query;

    // //Copy req.query
    // const reqQuery = { ...req.query };

    // //Fields to exclude
    // const removeFields = ['select', 'sort', 'page', 'limit'];

    // //loop over removeFields and delete them from reqQuery
    // removeFields.forEach(param => delete reqQuery[param]);

    // //Create Query String
    // let queryStr = JSON.stringify(reqQuery);

    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // //SELECT FIELDS
    // if (req.query.select) {
    //     const fields = req.query.select.split(',').join(' ');
    //     query = query.select(fields);
    // }

    // //Sort
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort('-createdAt');
    // }

    // //Pagination
    // const page = parseInt(req.query.page, 10) || 1;
    // const limit = parseInt(req.query.limit, 10) || 25;
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    // const total = await Bootcamp.countDocuments();

    // query = query.skip(startIndex).limit(limit);

    // const bootcamps = await query;

    // //Pagination Result
    // const pagination = {};

    // if (endIndex < total) {
    //     pagination.next = {
    //         page: page + 1,
    //         limit
    //     }
    // }

    // if (startIndex > 0) {
    //     pagination.prev = {
    //         page: page - 1,
    //         limit
    //     }
    // }

    // const bootcamps = await Bootcamp.find();

    // res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });

    res.status(200).json(res.advancedResults);
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {

    // try {

    //     const bootcamp = await Bootcamp.findById(req.params.id);

    //     if (!bootcamp) {
    //         return res.status(400).json({ success: false });
    //         Correct Format But Id Not found
    //         return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    //     }

    //     res.status(200).json({ success: true, data: bootcamp });
    // } catch (err) {
    //     res.status(400).json({ success: false });
    //     Incorrect Format
    //     next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id} because Id Format is wrong`, 404));
    //     next(err);
    // }



    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, count: bootcamp.length, data: bootcamp });
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // try {
    //     const bootcamp = await Bootcamp.create(req.body);

    //     res.status(201).json({ success: true, data: bootcamp })
    // } catch (err) {
    //     // res.status(400).json({ success: false });
    //     next(err);
    // }

    //Add user to body
    req.body.user = req.user.id;

    //Check for published bootcamps
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //If the user is not an admin, they can only add 1 bootcamp
    if (publishedBootcamp && req.user.role != 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a Bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp })

});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    // try {
    //     const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    //         new: true,
    //         runValidators: true
    //     });

    //     if (!bootcamp) {
    //         // return res.status(400).json({ success: false });
    //         return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    //     }

    //     res.status(200).json({ success: true, data: bootcamp });

    // } catch (err) {
    //     // res.status(400).json({ success: false });
    //     next(err);
    // }


    // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    let bootcamp = await Bootcamp.findById(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    }

    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: bootcamp });

});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // try {
    //     const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    //     if (!bootcamp) {
    //         // return res.status(400).json({ success: false });
    //         return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    //     }

    //     res.status(200).json({ success: true, data: {} });

    // } catch (err) {
    //     // res.status(400).json({ success: false });
    //     next(err);
    // }


    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    }

    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
    }

    bootcamp.remove();

    res.status(200).json({ success: true, data: {} });

});


exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {


    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });

});


exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with Id of ${req.params.id}`, 404));
    }

    //Make sure user is Bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a File`, 400));
    }

    const file = req.files.file;

    //Make Sure that the image as a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image File`, 400));
    }

    //Check Filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }


    //Create Custom Filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });

});