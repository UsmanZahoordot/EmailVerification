const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan")

const app = express();
dotenv.config({path:'./config/.env'})

//middleware
app.use(morgan('tiny'));

const PORT = process.env.PORT || 3001

app.get('/', (req, res)=>{
    res.send('Hello World')
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
module.exports = app;