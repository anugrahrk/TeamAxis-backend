const express=require("express")
const router=express.Router()
const userRouter=require("./user")
const TaskRouter=require("./task")
router.use('/user',userRouter)
router.use("/task",TaskRouter)
module.exports=router