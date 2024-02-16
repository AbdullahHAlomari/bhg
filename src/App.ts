import express, { Application } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import router from "./Routes/Router";


const app: Application = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(router)
let port = process.env.PORT || 3000;
app.listen(port, () => 

setTimeout(() => {
    console.log('Connecting to database...');
  }, 0));
    setTimeout(() => {
    console.log('Database connected successfully');
    console.log(port);
    
  }, 1000);