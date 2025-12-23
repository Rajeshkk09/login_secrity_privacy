require("dotenv").config();
const express  =  require("express");
const cookieParser  = require("cookie-parser");
const cors  =  require("cors");
const connection = require("./database/Dbconnection");
const { errorMiddlewares } = require("./middlewares/error");

const app  =  express();

app.use(cors({
    origin:[process.env],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))


connection()



app.use(errorMiddlewares);










module.exports = app;


