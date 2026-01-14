const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const debugCourse = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const courseData = {
            title: "Debug Course Title " + Date.now(),
            shortDescription: "Short desc",
            description: "Full desc",
            category: "IT",
            categoryCode: "IT",
            instructor: "Dr Debug",
            duration: "1 Month",
            price: 100,
            // modules, theme, icon should be auto-handled or defaulted if I use the logic from controller manually,
            // but here I am testing Model validation/db errors.
            // The controller adds defaults. Let's add them here to simulate controller.
            modules: [], 
            tags: [],
            icon: 'globe',
            theme: 'blue'
        };

        // Simulate Controller Logic
        if (!courseData.icon) courseData.icon = 'globe';
        if (!courseData.theme) courseData.theme = 'blue';
        if (!courseData.modules || courseData.modules.length === 0) {
            courseData.modules = [{ id: 1, title: 'Intro', description: 'Desc' }];
        }
        
        console.log('Attempting to create course:', courseData);

        const course = await Course.create(courseData);
        console.log('Course created successfully:', course._id);

    } catch (error) {
        console.error('SERVER ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugCourse();
