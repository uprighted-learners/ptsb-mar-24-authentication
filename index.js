const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Connection for mongodb
mongoose.connect("mongodb://localhost:27017/example_db");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));

// GET Route: Verified Request
// This route takes a token and verifies that it is legit
app.get("/verifiedRequest", (req, res) => {

    const header = req.headers["authorization"];
    const token = header;

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        res.json({ message: "Success", verified:  verified });
    } catch (err) {
        res.status(403).json("Token couldn't be verified");
    }    
});

// POST Route: Register
/*
    This route will register the user using the given username and password.

*/
app.post("/register", (req, res) => {
    const saltRounds = 10; // Number of hashes generated to come to the final hash that will be used.
    const plainTextPassword = req.body.password;
    const username = req.body.username;

    // Using bcrypt, hash the given password. This hashed password will be saved in the database.
    bcrypt.hash(plainTextPassword, saltRounds, async (err, hash) => {
        console.log("Unhashed password", plainTextPassword);
        console.log("Hashed password", hash);

        // Create user instance in the database using the hashed password
        const newUser = new User({ username: username, password: hash });
        await newUser.save()
    })

    res.json("Registration complete");
})

// POST Route: Login
/*
    This route will take the request body password and username
    and find a user's username. If a user is found, the password will be compared to the
    hashed password in the database. If the hashing decoding is successful, then the user has
    logged in and will receive a JWT token that is valid for 60 seconds.
*/
app.post("/login", async (req, res) => {
    const loginPassword = req.body.password; // user provided password
    // Find user with provided username
    const foundUser = await User.findOne({ username: req.body.username });

    console.log(foundUser);

    // Using bcrypt, use the password provided in req.body and compare it with the password in the db.
    bcrypt.compare(loginPassword, foundUser.password, (err, result) => {
        console.log("Password matches hash", result);

        // After hashing decrypting is successful and match. This means that the passwords match
        if (result) {
            // Create a JWT token
            const signedJWT = jwt.sign(req.body, process.env.SECRET_KEY, { expiresIn: 60 });
            // Send the response
            res.json({ message: "Login Successful", token: signedJWT});
        } else {
            res.json("Login failed");
        }
    })
})

// POST Request with hardcoded data.
// This route will create a JWT token using the payload below, the secret from the .env file. This token will expire in 60 seconds.
app.post("/loginWithGivenPayload", (req, res) => {
    const payload = {
        "sub": "1234567890",
        "name": "John Doe",
        "admin": true
    };

    const signedJWT = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 60 });
    console.log(signedJWT);

    res.status(201).json(signedJWT);
})

// PORT variable value. You can store this within your .env file as well
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT}`);
})