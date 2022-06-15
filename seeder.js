const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env'});

const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Course');
const User = require('./models/Users');
const Review = require('./models/Review')

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
});

//Read JSON Files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

//Import into DB
const importData = async () => {
    try{
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        
        console.log('All Data Imported into DB');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

//Delete Data
const deleteData = async () => {
    try{
        await Bootcamp.deleteMany();
        await Course.deleteMany(); 
        await User.deleteMany(); 
        await Review.deleteMany(); 

        console.log('All Data Destroyed From DB');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] === '-i'){
    importData();
}else if(process.argv[2] === '-d'){
    deleteData();
}