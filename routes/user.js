const express=require("express")
const { User, Department, }=require("../db")
// const {Task}=require("./db")
// const {Attachment}=require("./db")
const router=express.Router()
const bcrypt=require("bcrypt")
const zod=require("zod")
const jwt=require("jsonwebtoken")
const JWT_SECRET="MY_SECERT"
const Mware = require("../Mware")

const UserSchema=zod.object({
    username:zod.email(),
    password:zod.string(),
    department:zod.string(),
    fullName:zod.string()
})

router.post("/register",Mware("admin"), async(req,res)=>{
    const {success}=UserSchema.safeParse(req.body)
    if (!success){
        return res.status(411).json({
            "msg":"Invalid Inputs"
        })
    }
    const username=req.body.username
    const password=req.body.password
    const department=req.body.department
    const newPassword=await bcrypt.hash(password,10)
    try{
        const UserExist=await User.findOne({
            username:username
        })
        if(UserExist){
            return res.status(411).json({
                "msg":"User already Exist"
            })
        }
        else{
            const dep=await Department.findOne({
                name:department
            })
            const UserRes=await User.create({
                username:username,
                password:newPassword,
                departmentId:dep._id,
                fullName:req.body.fullName
            })
            return res.status(200).json({
                msg:"User created successfully"
            })


        }
    }
    catch(e){
        console.log(e)
        return res.status(411).json({
            err:"Something went wrong"
        })
    }

})

const SigninSchema=zod.object({
    username:zod.string(),
    password:zod.string()
})

router.post("/signin",async(req,res)=>{
    const {success}=SigninSchema.safeParse(req.body)
    if (!success){
        return res.status(411).json({
            "msg":"Invalid Inputs"
        })
    }
    const username=req.body.username
    const password=req.body.password
    if (username=="admin" && password=="admin"){
        const token=jwt.sign({username,role:"admin"},JWT_SECRET)
        return res.json({
            admin:"Admin authenticated Successfully",
            token:"Bearer "+token
        })
    }
    else{
        try{
            const ValidUser=await User.findOne({
            username
        })

        if(ValidUser){
            const MatchPassword=bcrypt.compare(password,ValidUser.password)
            if (MatchPassword){
            const token=jwt.sign({username,role:"user"},JWT_SECRET)
            return res.json({
                user:"User login Success",
                userId:ValidUser._id,
                token:"Bearer "+token
            })
            }
        else{
            return res.json({
                msg:"Username and Password Doesnt match."
            })
        }}
}
catch(e){
    return res.json({
        msg:"catch"
    })
}
    }
})

const UserUpdateSchema=zod.object({
    password:zod.string().optional(),
    status:zod.string().optional(),
    fullName:zod.string().optional()

})
router.put("/update/:id",Mware("admin"),async(req,res)=>{
        const { success }=UserUpdateSchema.safeParse(req.body)
        if(!success){
            return res.json({
                err:"Inavlid Format"
            })
        }
        const id=req.params.id
        if (req.body.password)
            {
                var HashPassword=await bcrypt.hash(req.body.password,10)
            }
        try{
            await User.findByIdAndUpdate(id,{
                password:HashPassword,
                status:req.body.status,
                fullName:req.body.fullName

            })
            return res.json({
                msg:"User Updated Successfully"
            })
        }
        catch(e){
            return res.json({
            err:"Unable to Update User"
            })
        }
})
router.get("/view",Mware("admin"),async(req,res)=>{
    try{
        const Users=await User.find()
        const UserwtDept=await Promise.all(
            Users.map(async(user)=>{
                const dept=await Department.findById(user.departmentId)
                return {
                    _id:user._id,
                    fullName:user.fullName,
                    username:user.username,
                    department:dept.name,
                    status:user.status
                }
            })
        )
        return res.json({
           UserwtDept
        })
    }
    catch(e){
        return res.json({
            msg:"You must be an admin to view User",
            err:e
        })
    }
})

module.exports=router