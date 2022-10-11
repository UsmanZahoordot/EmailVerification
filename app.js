const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan")

const app = express();
app.use(morgan('tiny'));

const connectDB = require('./config/db');

dotenv.config({path:'./config/.env'})

connectDB();
app.get('/', (req, res)=>{
    res.send('Hello World')
})
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
module.exports = app;