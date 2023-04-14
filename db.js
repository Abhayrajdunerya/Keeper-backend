const mongoose = require("mongoose");
require('dotenv').config();

// const mongoURI = "mongodb://localhost:27017/Keeper_v2";
const mongoURI = process.env.DATABASE;

const connectToMongo = () => {
    mongoose.connect(process.env.DATABASE, {})
        .then(() => console.log('DB CONNECTED'))
        .catch(err => console.log("DB CONNECTION ERR ", err))
}



module.exports = connectToMongo;