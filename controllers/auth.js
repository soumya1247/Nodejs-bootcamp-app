const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/Users');

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
    // //Create Token
    // const token = user.getSignedJwtToken();

    // res.status(200).json({ success: true, token });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide and Email and Password', 400));
    }

    //Check For User
    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    //Check if pw Matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    sendTokenResponse(user, 200, res);
    // //Create Token
    // const token = user.getSignedJwtToken();

    // res.status(200).json({ success: true, token });
});

//Log user out/ clear cookie
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//Get Current logged in user 
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

//Update User Details
exports.updateDetails = asyncHandler(async (req, res, next) => {

    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//Update password
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Password is incorrect`, 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});


exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    //Create Reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you(or someone) has requested reset of a password.Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });

        res.status(200).json({
            success: true,
            data: 'Email sent'
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse(`Reset Email could not be sent`, 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

//Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {

    //Get hashed Token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid Token', 400));
    }

    //Set new Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

//Get Token from model,create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    //Sending HTTPS For Prod Env
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
}