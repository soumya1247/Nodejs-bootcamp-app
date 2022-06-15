const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userInfo } = require('os');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add mail'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpired: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Encrypt Password using bcryptjs
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
};

//Match user entered passoword to hashed password in Database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hash Token and set to resetPasswordToken Field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set Expire
    this.resetPasswordExpired = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);