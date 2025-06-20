import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    password: String,
});

export default mongoose.model('User', userSchema);
// This code defines a User model for MongoDB using Mongoose.