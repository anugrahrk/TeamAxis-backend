const express =require("express")
const { Task, Department }=require("../db")
const router=express.Router()
const Mware=require("../Mware")
const zod=require("zod")

const taskSchema=zod.object({
    name:zod.string(),
    description:zod.string(),
    startDate:zod.string(),
    endDate:zod.string(),
    department:zod.string()
})
router.post("/create",Mware(),async(req,res)=>{
    const { success }=taskSchema.safeParse(req.body)
    if (!success){
        return res.json({
            msg:"Error in Validation ! Check your inputs"
        })
    }
    try{const dep=await Department.findOne({
        name:req.body.department
    })
    const depId=dep._id
    const TaskAdd=await Task.create({
        name:req.body.name,
        description:req.body.description,
        depId:depId,
        endDate:req.body.endDate,
        startDate:req.body.startDate
    })
    if(TaskAdd){
        return res.json({
            msg:"sucess",
            TaskId:TaskAdd._id
        })
    }
    else{
        return res.json({
            err:"Task Not Added"
        })
    }}
    catch(e){
        return res.json({
            msg:"Catch",
            error:e
        })
    }
})

const taskUpdate=zod.object({
    endDate:zod.string().optional(),
    startDate:zod.string().optional(),
    name:zod.string().optional(),
    description:zod.string().optional(),
    progress:zod.number().optional(),
    completed:zod.boolean().optional(),
    attachment:zod.string().optional()

})
router.put("/update/:id",Mware("user"),async(req,res)=>{
    const { success }=taskUpdate.safeParse(req.body)
    if (!success){
        res.json({
            err:"Zod Val Failed"
        })
    }
    const id =req.params.id
    try{
        await Task.findByIdAndUpdate(id,{
        name:req.body.name,
        description:req.body.description,
        progress:req.body.progress,
        startDate:req.body.startDate,
        endDate:req.body.endDate,
        completed:req.body.completed,
        attachment:req.body.attachment

    })
    return res.json({
        msg:"update success"
    })
    }
    catch(e){
       return res.json({
            msg:"catch error"
        })
    }


})



module.exports=router