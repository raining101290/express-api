const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

// Import routes
const courses = require('./routes/courses');
const home = require('./routes/home');
const genres = require('./routes/genres');

// Connect to MongoDB (example connection string)
mongoose.connect('mongodb://localhost/express-api', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => dbDebugger('Connected to MongoDB...'))
  .catch(err => dbDebugger('Could not connect to MongoDB...', err));


const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  author: String,
  tags: [ String ],
  date: { type: Date, default: Date.now },
  isPublished: Boolean
});

const Course = mongoose.model('Course', courseSchema);

async function createCourse() {
  const course = new Course({
    name: 'React Course', 
    author: 'Mosh', 
    tags: ['React', 'frontend'], 
    isPublished: true
  });
  const result = await course.save();
  console.log('result::', result);
}

createCourse();

async function getCourses() {
  const courses = await Course
    .find({ author: 'Mosh', isPublished: true })
    .limit(10)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1 });
  console.log('courses::', courses);
}

getCourses();

// Simulate database connection
dbDebugger('Connected to the database...');

const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/courses', courses);
app.use('/', home);
app.use('/api/genres', genres);

// Use morgan for logging in development environment
if(app.get('env') === 'development') {
    app.use(morgan('tiny'));
    startupDebugger('Morgan enabled...');
}

//configurations
// console.log('Application Name: ' + config.get('name'));
// console.log('Mail Server: ' + config.get('mail.host'));
// console.log('Mail Password: ' + config.get('auth.pass'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;