//connects your server to MongoDB Atlas
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        //mongoose connects the URL string to the server
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;