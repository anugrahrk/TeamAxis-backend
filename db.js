const mongoose=require("mongoose")
const { string } = require("zod")
const mongooseURI="mongodb+srv://anugrahrk6_db_user:84xtlrWwYgbNkuDr@cluster007.p6z4rkj.mongodb.net/PMS"
mongoose.connect(mongooseURI)
const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    fullName:{
        type:String
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    departmentId:{
        type:mongoose.Types.ObjectId,
        required:true,
    },
    status:{
        type:String,
        default:"Inactive"
    },
    profilePic: { 
    type: String,
  }
})
const taskSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    progess:{
        type:Number,
        default:0
    },
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        required:true
    },
    depId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    AttachmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Attachment"
    }

})
const DepartmentSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})
const AttachmentSchema=mongoose.Schema({
    fileName:String,
    fileUrl:String,
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },
    uploadedAt:{
        type:Date,
        default:Date.now
    }
})
const User=mongoose.model("User",userSchema)
const Task=mongoose.model("Task",taskSchema)
const Attachment=mongoose.model("Attachment",AttachmentSchema)
const Department=mongoose.model("Department",DepartmentSchema)

module.exports={
    User,
    Task,
    Attachment,
    Department
}
