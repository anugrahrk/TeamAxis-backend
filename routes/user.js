const express=require("express")
const { User }=require("../db")
// const {Task}=require("./db")
// const {Attachment}=require("./db")
const router=express.Router()
const bcrypt=require("bcrypt")
const zod=require("zod")
const jwt=require("jsonwebtoken")
const JWT_SECRET="MY_SECERT"
const mware=require("../Mware")

const UserSchema=zod.object({
    username:zod.email(),
    password:zod.string().min(6),
    department:zod.string()
})

router.post("/register",async(req,res)=>{
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
            const UserRes=await User.create({
                username:username,
                password:newPassword,
                department:department
            })
            return res.status(411).json({
                "msg":"User created successfully"
            })

        }
    }
    catch(e){
        console.log(e)
        return res.status(411).json({
            "msg":"Something went wrong"
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
            "msg":"Admin authenticated Successfully",
            "token":token
        })
    }
    else{
        try{
            const ValidUser=await User.findOne({
            username
        })
        if(ValidUser){
            const token=jwt.sign({username,role:"user"},JWT_SECRET)
            return res.json({
                msg:"User login Success",
                token
            })
        }
}
catch(e){
    return res.json({
        msg:"catch"
    })
}
    }
})

module.exports=router