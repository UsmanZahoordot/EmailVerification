import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import {connectDB} from './config/db.js';

const app = express();
app.use(morgan('tiny'));


config({path:'./config/.env'})

connectDB();
app.get('/', (req, res)=>{
    res.send('Hello World')
})
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
export default app;