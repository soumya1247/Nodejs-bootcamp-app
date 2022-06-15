const express = require('express');
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../middleware/advancedResults');

//Include Other resource Router
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// app.get('/', (req, res) => {
//     res.send('<h1>Hello from express</h1>');
//     res.send({ name: 'John'});
//     res.json({ name: 'John'});

//     res.sendStatus(400);
//     res.status(400).json({ success: false, data: { id: 1 } });
// });

// router.get('/', (req, res) => {
//     res.status(200).json({ success: true, msg: 'Get All Bootcamps' });
// });

// router.get('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Get a Single Bootcamp ${req.params.id}` });
// });

// router.post('/', (req, res) => {
//     res.status(200).json({ success: true, msg: 'Create a new Bootcamp' });
// });

// router.put('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Update a Bootcamp ${req.params.id}` });
// });

// router.delete('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Delete a Bootcamp ${req.params.id}` });
// });

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect,authorize('publisher', 'admin'), createBootcamp);

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher', 'admin'), updateBootcamp).delete(protect,authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect ,authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;