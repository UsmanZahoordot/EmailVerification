import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import {connectDB} from './config/db.js';
import {router} from './server/routes/api_routes.js'
import {flushDb} from './server/crons/flushdb.js'
import {resetConsumedCreditsJob} from './server/crons/reset_consumed.js'
import cors from 'cors';

const app = express();

app.use(cors());
app.use(morgan('tiny'));
config({path:'./config/.env'})


connectDB();

app.use(express.json({limit: '50mb'}));

app.use('/api', router);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});


flushDb();
resetConsumedCreditsJob();

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
export default app;
