const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {body, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const fetchUser = require("../middleware/fetchUser");
// const JWT_SECRET = "bsu1y8y3kdou28uri2?^@TT*$bge2rt1yjsb1901wt";
const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: Create a User using: POST "/api/user/createUser". No login required
router.post("/createUser", [
    body("name", "Enter a valid name.").isLength({min: 3}),
    body("email", "Enter a valid email").isEmail({min: 5}),
    body("password", "Password must be atleast 5 characters.").isLength({min: 5})
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({errors: errors.array()});
    }

    // Check weather the user with this email exists already
    try {
        let user = await User.findOne({email: req.body.email});
        if (user) {
            success = false;
            return res.status(400).send({success, error: "Sorry a user with this email already exists"});
        } else {
            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(req.body.password, salt);

            // Create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPassword
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({success, authtoken});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }

});

// ROUTE 2: Authentic a User using: POST "/api/user/login". No login required
router.post("/login", [
    body("email", "Enter a valid email").isEmail({min: 5}),
    body("password", "Password cannot be blank.").exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({errors: errors.array()});
    }

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email: email});
        if (!user) {
            success = false;
            return res.status(400).json({success, error: "Please try to login with correct Credentials"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({success, error: "Please try to login with correct Credentials"});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken});

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

// ROUTE 3: Get loggedin User Details using: POST "/api/user/getuser". Login required
router.post("/getuser", fetchUser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

module.exports = router;