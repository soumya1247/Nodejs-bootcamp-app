const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout } = require('../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;