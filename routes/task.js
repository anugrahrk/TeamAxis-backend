
const express =require("express")
const { Task, Department, User, Attachment }=require("../db")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router=express.Router()
const Mware=require("../Mware")
const zod=require("zod")

// ------------------ Multer Config ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // store files in uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("File Not Supported"), false);
};

const upload = multer({ storage, fileFilter });

// Make uploads folder publicly accessible
router.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const taskSchema=zod.object({
    name:zod.string(),
    description:zod.string(),
    startDate:zod.string(),
    endDate:zod.string().optional(),
    department:zod.string(),
    createdBy:zod.string().optional()
})
router.post("/create",Mware(),async(req,res)=>{
    const { success }=taskSchema.safeParse(req.body)
    if (!success){
        return res.json({
            err:"Error in Validation ! Check your inputs"
        })
    }
    try{const dep=await Department.findOne({
        name:req.body.department
    })
    const depId=dep._id
    const UserFind=req.body.userId ? await User.findOne({_id:req.body.userId}) : { fullName:"Admin"}
    const TaskAdd=await Task.create({
        name:req.body.name,
        description:req.body.description,
        depId:depId,
        endDate:req.body.endDate,
        startDate:req.body.startDate,
        createdBy:UserFind.fullName 
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
            err:"Catch",
            error:e
        })
    }
})

const taskUpdate=zod.object({
    endDate:zod.string().optional(),
    startDate:zod.string().optional(),
    name:zod.string().optional(),
    description:zod.string().optional(),
    progess:zod.number().optional(),
    completed:zod.boolean().optional(),
    attachment:zod.string().optional(),
    AdminComments:zod.string().optional(),
    UserComplete:zod.boolean().optional()

})
router.put("/update/:id",Mware(),async(req,res)=>{
    const { success }=taskUpdate.safeParse(req.body)
    if (!success){
        return res.json({
            err:"Zod Val Failed"
        })
    }
    const id =req.params.id
    const AttachmentFind=await Attachment.findOne({taskId:id})
    try{
        await Task.findByIdAndUpdate(id,{
        name:req.body.name,
        description:req.body.description,
        progess:req.body.progress,
        startDate:req.body.startDate,
        endDate:req.body.endDate,
        completed:req.body.completed,
        attachmentName:AttachmentFind?.fileName,
        AdminComments:req.body.AdminComments,
        UserComplete:req.body.UserComplete

    })
    return res.json({
        msg:"update success"
    })
    }
    catch(e){
       return res.json({
            err:"catch error"
        })
    }
})
router.get("/view/",Mware(),async(req,res)=>{
    // const role=req.user.role
    // if (role=="admin"){
    let filter=req.query.filter || ""

    if (filter?.startsWith('"')&& filter?.endsWith('"')){
        filter=filter.slice(1,-1)
    }

        const TaskAll=await Task.find(
            filter
    ? { depId: filter }
    : {} // return all tasks if no filter
        )
        if (TaskAll){
        return res.json({
            msg:"Success",
            task:TaskAll
        })}
//     }
//     else if(role=="user"){
//         const user=await User.findOne({
//             _id:req.params.id
// }
//         )
//         if (user){
//             const TaskList=await Task.find({
//                 depId:user.departmentId
//             })
//                 return res.json({
//                     TaskList
//                 })
//         }
//         else{
//             return res.json({
//                 msg:"User Not Found"
//             })
//         }
//     }
    else{
        return res.json({
            msg:"To access you must be either be an User or an Admin."
        })
    }
})
router.delete("/delete/:id",Mware("admin"),async(req,res)=>{
    const id=req.params.id
    try{
        await Task.deleteOne({
        _id:id
    })
    return res.json({
        msg:"Task Deleted"
    })
       }
    catch(e){
        return res.json({
            err:e
        })
    }

})


router.post("/upload/:taskId",Mware("user"), upload.single("file"), async (req, res) => {
  const { taskId } = req.params;
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
  const attachment=await Attachment.findOne({taskId})
  if (attachment){
    // Delete old file from uploads folder
      if (fs.existsSync(attachment.fileUrl)) {
        fs.unlinkSync(attachment.fileUrl);
      }

      // Update existing document
      attachment.fileName = req.file.originalname;
      attachment.fileUrl = req.file.path;
      attachment.uploadedAt = Date.now();
      await attachment.save();

      return res.json({
        success: true,
        message: "File updated successfully",
        attachment,
      });
  }

  const newAttachment = await Attachment.create({
    taskId,
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
  });

  res.json({ success: true, attachment: newAttachment });
});


router.get("/download/:id",Mware(), async (req, res) => {
  const attachment = await Attachment.findOne({taskId:req.params.id});
  if (!attachment) return res.status(404).json({ success: false, error: "File not found" });

  const filePath = path.join(__dirname, "..", attachment.fileUrl);
  res.download(filePath, attachment.fileName);
});

router.get('/file/view',Mware(),async(req,res)=>{
    const AttachmentView=await Attachment.find()
    return res.json({
        AttachmentView
})
})




module.exports=router