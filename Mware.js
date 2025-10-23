const jwt=require("jsonwebtoken")
const JWT_SECRET=process.env.JWT_SECRET

const Mware=( Arole=null )=>{
    return(req,res,next)=>{
    const token=req.headers.authorization
    if(!token || !token.startsWith("Bearer ")){
        res.json({
            msg:"Invalid Token"
        })
    }
    const auth=token.split(" ")[1]
    try{
    const decoded=jwt.verify(auth,JWT_SECRET)
    req.user=decoded
    // console.log(decoded)
    if(Arole && decoded.role !== Arole){
        return res.json({
            msg:"forbidden"
        })
    }
    next()     
    }
    catch(e){
        res.json({
            msg:"Catch mware",
            err:e
        })
    }
}}
module.exports=Mware