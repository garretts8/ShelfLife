const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    //Not required for Google OAuth user sign-in
    password: { type: String },
    //To identify unique google accounts
    googleId: { type: String },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Only hash password if it exists and is modified
UserSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//Method to compare password entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // Google users don't have passwords
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);