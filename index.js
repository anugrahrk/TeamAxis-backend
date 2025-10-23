const express=require("express")
const app=express()
const path = require("path");
const dotenv=require('dotenv')
dotenv.config()
const port=process.env.PORT

const MainRoute=require("./routes/index")

const cors=require("cors")
app.use(cors())
app.use(express.json())
app.use("/api/",MainRoute)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(port)