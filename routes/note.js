const express = require("express");
const router = express.Router();
const {body, validationResult} = require("express-validator");
const Note = require("../models/Note");
const fetchUser = require("../middleware/fetchUser");

// ROUTE 1: Get All the Notes using: GET "/api/notes/fetchAllNotes". Login required
router.get("/fetchAllNotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({user: req.user.id});
        res.send(notes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

// ROUTE 2: Add a new Note using: POST "/api/notes/addNote". Login required
router.post("/addNote", fetchUser, [
    body("title", "Enter a valid title.").isLength({min: 3}),
    body("content", "Content must be atleast 5 characters.").isLength({min: 5})
], async (req, res) => {
    try {
        const {title, content} = req.body;

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const note = new Note({
            title, content, user: req.user.id
        });
        const savedNote = await note.save();
        res.send(savedNote);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updateNote". Login required
router.put("/updateNote/:id", fetchUser, async (req, res) => {
    const {title, content} = req.body;
    try {
        // Create a newNote object
        const newNote = {};
        if (title) {newNote.title = title}
        if (content) {newNote.content = content}

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note =  await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.send({note});

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deleteNote". Login required
router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.send({Success: "Note has been deleted", note: note});

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server Error");
    }
});

module.exports = router;