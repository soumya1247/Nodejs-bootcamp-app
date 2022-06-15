const express = require('express');
const { getCouses, getCouse, addCouse, updateCouse, deleteCouse } = require('../controllers/courses');

const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), getCouses).post(protect,authorize('publisher', 'admin'), addCouse);
router.route('/:id').get(getCouse).put(protect,authorize('publisher', 'admin'), updateCouse).delete(protect,authorize('publisher', 'admin'), deleteCouse);

module.exports = router; 