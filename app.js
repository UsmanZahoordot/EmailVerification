import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import {connectDB} from './config/db.js';
import {router} from './server/routes/api_routes.js'
import bodyParser from 'body-parser';

const app = express();
app.use(morgan('tiny'));


config({path:'./config/.env'})

connectDB();

app.use(bodyParser.json());
app.use('/api', router);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
export default app;