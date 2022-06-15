const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/Users');

//Get All Users
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//Get Single User
exports.getUser = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: user
    });
});

//Create a User
exports.createUser = asyncHandler(async (req, res, next) => {

    const user = await User.create(req.body);
    
    res.status(201).json({
        success: true,
        data: user
    });
});

//Update user
exports.updateUser = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: user
    });
});

//Delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
        success: true,
        data: {}
    });
});