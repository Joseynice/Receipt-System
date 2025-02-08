const mongoose = require('mongoose');
require('dotenv').config();

dbConnect = async () => {
       await mongoose.connect(process.env.DB_URL);
}

module.exports = dbConnect; 