const express=require("express")
const app=express()
const path = require("path");
const port=3000

const MainRoute=require("./routes/index")

const cors=require("cors")
app.use(cors())
app.use(express.json())
app.use("/api/",MainRoute)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(port)