const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin@gmail.com';
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('Admin user NOT found. Creating one...');
            await User.create({
                name: 'Admin User',
                email: email,
                password: 'admin@123',
                role: 'admin',
                isVerified: true
            });
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user found.');
            console.log('Role:', user.role);
            // We won't print the password hash, but presence is good.
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAdmin();
