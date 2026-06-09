const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Defines how user data is structured and stored in the database
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

// Hash password before saving - using function() instead of arrow
UserSchema.pre('save', function(next) {
    // Only hash if password exists and is modified
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    
    const user = this;
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

//Method to compare password entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Google users don't have passwords
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);