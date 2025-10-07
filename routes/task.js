const express =require("express")
const { Task, Department }=require("../db")
const router=express.Router()
const Mware=require("../Mware")
const zod=require("zod")

const taskSchema=zod.object({
    title:zod.string(),
    description:zod.string(),
    startDate:zod.string(),
    endDate:zod.string(),
    department:zod.string(),
    attachment:zod.string()
})
router.post("/create/:id",Mware(),(req,res)=>{
    const { sucess }=taskSchema.safeParse(req.body)
    if (!sucess){
        return res.json({
            msg:"Error in Validation ! Check your inputs"
        })
    }
    

})

module.export=router