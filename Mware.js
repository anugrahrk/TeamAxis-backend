const jwt=require("jsonwebtoken")
const JWT_SECRET="MY_SECERT"
const Mware=({ role:"admin"||"user"||"" },(req,res,next)=>{
    const token=req.headers.authorization
    if(!auth || !auth.startsWith("Bearer ")){
        res.json({
            msg:"Invalid Token"
        })
    }
    try{

        if (Arole=="admin" || Arole=="user"){
            const decoded=jwt.verify({role:Arole,token},JWT_SECRET)
            if (decoded){
                next()
            }
            else{
                res.json({
                    msg:"Invalid user"
                })
            }
        }
        else if(Arole==""){
            const decoded=jwt.verify(token,JWT_SECRET)
            if (decoded){
                next()
            }
            else{
                res.json({
                    msg:"Invalid user"
                })
            }
        }

    }
    catch(e){
        res.json({
            msg:"Catch mware"
        })
    }
})
module.exports=Mware