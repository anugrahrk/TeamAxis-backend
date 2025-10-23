const express=require("express")
const { User, Department, }=require("../db")
// const {Task}=require("./db")
// const {Attachment}=require("./db")
const router=express.Router()
const bcrypt=require("bcrypt")
const zod=require("zod")
const jwt=require("jsonwebtoken")
const JWT_SECRET="MY_SECERT"
const multer = require("multer");
const path = require("path");
const Mware = require("../Mware")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

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
                status:ValidUser.status,
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
    fullName:zod.string().optional(),

})
router.put("/update/:id",Mware(),async(req,res)=>{
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
        const FindUser=await User.findById(id)
        if(!FindUser){
            return res.json({
                err:"No user Exist"
            })
        }
        const ExistingUser=await User.findOne({
            departmentId:FindUser.departmentId,
            status:"Active",
            _id:{$ne:id}
        })
        if (ExistingUser && req.body.status=== "Active"){
            return res.json({
                exist:"One active User already Exist"
            })
        }
        const { profilePic } = req.body;
        try{
            await User.findByIdAndUpdate(id,{
                password:HashPassword,
                status:req.body.status,
                fullName:req.body.fullName,
                profilePic

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
router.get("/view",Mware(),async(req,res)=>{
    const filter=req.query.filter||""
    try{
        const Users=await User.find({
            $or:[
                {
                    fullName:{"$regex":filter,"$options":"i"}
                }
            ]
        })
        const UserwtDept=await Promise.all(
            Users.map(async(user)=>{
                const dept=await Department.findById(user.departmentId)
                return {
                    _id:user._id,
                    fullName:user.fullName,
                    username:user.username,
                    department:dept.name,
                    status:user.status,
                    depId:user.departmentId,
                    profilePic:user.profilePic
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

router.post("/profile/:id", upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = `http://localhost:3000/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: filePath },
      { new: true }
    );

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports=router