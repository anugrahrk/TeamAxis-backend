const mongoose=require("mongoose")
const mongooseURI="mongodb+srv://anugrahrk6_db_user:84xtlrWwYgbNkuDr@cluster007.p6z4rkj.mongodb.net/PMS"
mongoose.connect(mongooseURI)
const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    department:{
        type:String,
        required:true,
    }
})
const taskSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    taskId:{
        type:Number,
        required:true
    },
    decscription:{
        type:String,
        required:true
    },
    progess:{
        type:Number,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }

})
const AttachmentSchema=mongoose.Schema({
    name:{
        type:String,
    },
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"task",
        required:true
    }
})
const User=mongoose.model("User",userSchema)
const Task=mongoose.model("Task",taskSchema)
const Attachment=mongoose.model("Attachment",AttachmentSchema)

module.exports={
    User,
    Task,
    Attachment
}
