const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo DB Connected!!');
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;