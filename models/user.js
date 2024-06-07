// User Schema
const mongoose = require("mongoose");

// Setup schema for user. Indicate what properties exist for this user model.
const userSchema = new mongoose.Schema({
    username: String, // username must be string
    password: String // pasword must be string
});

// Create and export the User model using the schema above
module.exports = mongoose.model("User", userSchema);