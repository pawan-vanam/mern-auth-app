const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const debugCourse = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const courseData = {
            title: "Community Service " + Date.now(),
            shortDescription: "This is the community development course",
            description: "You will be to do community service.",
            category: "Other",
            categoryCode: "UG",
            instructor: "John Joe",
            duration: "3 Months",
            price: 199,
            // Controller logic simulation
            modules: [], 
            tags: [],
            // Icon/Theme might be undefined coming from frontend if Title doesn't match keywords?
            // Controller handles this:
            // if (!req.body.icon) req.body.icon = assignIcon(title);
            // "Community Service" might default to 'book' and 'indigo'.
        };

        // Simulate Controller Logic exactly as in courseController.js
        const assignIcon = (title) => {
            const t = title.toLowerCase();
            if (t.includes('web') || t.includes('full stack') || t.includes('html') || t.includes('react')) return 'globe';
            if (t.includes('data') || t.includes('science') || t.includes('python')) return 'code';
            if (t.includes('cyber') || t.includes('security') || t.includes('hacking')) return 'lock';
            if (t.includes('network') || t.includes('cloud')) return 'server';
            if (t.includes('app') || t.includes('mobile') || t.includes('android') || t.includes('ios')) return 'mobile';
            if (t.includes('ai') || t.includes('artificial') || t.includes('machine')) return 'sparkles';
            return 'book'; // Default
        };

        const assignTheme = (title, category) => {
            const t = title.toLowerCase();
            const c = category.toLowerCase();
            
            if (c.includes('it') || t.includes('web')) return 'green';
            if (c.includes('data') || t.includes('data')) return 'blue';
            if (c.includes('cs') || t.includes('cyber')) return 'orange';
            if (c.includes('management')) return 'purple';
            return 'indigo';
        };

        // Apply controller logic
        if (!courseData.icon) courseData.icon = assignIcon(courseData.title);
        if (!courseData.theme) courseData.theme = assignTheme(courseData.title, courseData.category);

        if (!courseData.modules || courseData.modules.length === 0) {
             courseData.modules = [
                { id: 1, title: 'Introduction', description: 'Course overview and setup' },
                { id: 2, title: 'Core Concepts', description: 'Fundamental principles' },
                { id: 3, title: 'Advanced Topics', description: 'Deep dive into complex areas' },
                { id: 4, title: 'Project', description: 'Hands-on practical assignment' }
            ];
        }

        if (!courseData.tags) {
             const typeTag = courseData.category.includes('IT') || courseData.category.includes('CS') ? 'UG' : 'PG'; 
             courseData.tags = [
                { label: 'Certification', type: 'primary' },
                { label: typeTag, type: 'secondary' }
            ];
        }

        console.log('Attempting to create course with data:', JSON.stringify(courseData, null, 2));

        const course = await Course.create(courseData);
        console.log('Course created successfully:', course._id);

    } catch (error) {
        console.error('SERVER ERROR FULL STACK:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugCourse();
