const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error')
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to Database

connectDB();

//Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const req = require('express/lib/request');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//Body Parser
app.use(express.json());
 
//Cookie Parser
app.use(cookieParser());

//Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File Uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//rate limit
const limiter = rateLimit({
    windowMs: 10 * 60* 1000, //10 mins
    max: 100
});

app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

// app.use(logger);

//Mount Routers

app.use('/api/v1/auth', auth);
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on PORT : ${PORT} `));

//Handle Unhandled Promise Rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);

    //Close Server

    server.close(() => process.exit(1));

});