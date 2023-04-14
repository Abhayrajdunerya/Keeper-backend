const connectToMongo = require("./db");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

connectToMongo();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Available Routes
app.use("/api/user", require("./routes/user"));
app.use("/api/note", require("./routes/note"));

app.listen(port, () => {
    console.log("Keeper: Backend is running on port " + port);
});

module.exports = app;