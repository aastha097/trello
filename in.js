//signup-users array,signin,onbparding->inputs:name,description btn:create org-org[]
// dasdhboard page->create board->title,organizationId boards[]
//trello board page->craete new issue->title,boardid ->issues[]

const express=require('express')
const app=express()
const jwt=require('jsonwebtoken')
const {organizationmodel,usermodel,boardsmodel}=require('./models')
app.use(express.json())
const users=[]
const org=[]
const boards=[]
//const issues=[]

let orgid=1
let userid=1
let boardid=1

const jwtpassword="aastha922gasjskhiuotopsecret"

app.post("/signup",async (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const userexists=await usermodel.findOne({
        username:username
    });
    if(userexists){//bad status code
        return res.status(400).json({ 
            message:"user with this username already exists"
        })
    }
    const newuser=await usermodel.create({
        username:username,
        password:password
    })
    res.json({
        id:newuser._id,
        message:"You have signed up"
    })
})

app.post("/signin",async (req,res)=>{
    const username=req.body.username
    const password=req.body.password//{username,password}
    const userexists=await usermodel.findOne({
        username:username,
        password:password
    })
    if(!userexists){
        res.status(401).json({
            message:"Incorrect credentials"
        })
        return
    }
    const token=jwt.sign({
        userId:userexists._id
    },jwtpassword)
    res.json({
        token
    })
})

function middleware(req,res,next){
    const token=req.headers.token
    if(!token){
        return res.status(403).json({message:"You are not signed in"})
    }
    const decoded=jwt.verify(token,jwtpassword)
    if(decoded.userId){
        req.userId=decoded.userId//attaching userId to request so next funct can use
        next()
    }else{
        return res.status(403).json({message:"Incorrect token"})
    }
}

app.post("/organization",middleware,async (req,res)=>{
    const title=req.body.title
    const description=req.body.description
    const neworg=await organizationmodel.create({
        title:title,
        description:description,
        admin:req.userId,
        members:[]//initially empty
    })
    res.json({
        message:"Organization created",
        id:neworg._id
    })
})

app.post("/board",middleware,async(req,res)=>{
    const title=req.body.title
    const organizationId=req.body.organizationId
    if(!title||!organizationId){
        return res.status(401).json({message:"Title and organizationId required!"})
    }
    const organization=await organizationmodel.findOne({
        _id:organizationId
    })
    if(!organization){
        return res.status(401).json({message:"Organization not found"})
    }
    const newboard=await boardsmodel.create({
        title:title,
        organizationId:organizationId
    })
    res.json({
        message:"Board created",
        id:newboard._id
    })
})

//app.post("/issue",(req,res)=>{
//
//})

app.post("/add-membertoorganization",middleware,async (req,res)=>{
    const organizationid=req.body.organizationid
    const memberUsername=req.body.memberUsername
    
    const organization=await organizationmodel.findOne({
        _id:organizationid
    })
    if(!organization||organization.admin.toString()!==req.userId){
        return res.status(411).json({message:"Either this org doesnt exist or you are not the admin of this org"})
    }
    const memberuser=await usermodel.findOne({
        username:memberUsername
    })
    if(!memberuser){
        return res.status(411).json({message:"No user with this username"})
    }
    if(organization.members.includes(memberuser._id)){
        return res.status(411).json({message:"This user is already member"})
    }
    await organizationmodel.updateOne({
        _id:organizationid
    },{
        $push:{
            "members":memberuser._id
        }
    })
    res.json({
        message:"New user added"
    })
})

app.get("/organizations",middleware,async (req,res)=>{
    const organizationid=req.query.organizationid
    const organization=await organizationmodel.findOne({
        _id:organizationid
    })
    if(!organization||organization.admin.toString()!==req.userId){
        return res.status(411).json({message:"Either this org doesnt exist or you are not the admin of this org"})
    }
    const members=await usermodel.find({
        _id:organization.members
    })
    res.json({
        organization:{
            title:organization.title,
            description:organization.description,
            members:members.map(m=>({
                username:m.username,
                id:m._id
            }))
        }
    })
})

app.get("/boards",middleware,async(req,res)=>{
    const organizationid=req.query.organizationid.toString()
    const organization=await organizationmodel.findOne({
        _id:organizationid
    })
    if(!organization){
        return res.status(404).json({message:"Organization not found"})
    }
    const ismember=organization.members.some(id=>id.toString()===req.userId)
    const isadmin=organization.admin.toString()===req.userId
    if(!ismember && !isadmin){
        return res.status(403).json({message:"You do not have access to this org"})
    }
    const allboards = await boardsmodel.findOne({
        organizationId:organizationid
    })
    if(!allboards||allboards.length===0){
        return res.status(200).json([])
    }
    res.json({
        allboards
    })

})


app.get("/members",middleware,(req,res)=>{
    const organizationid=parseInt(req.query.organizationid)
    const organization=org.find(u=>u.id===organizationid)
    if(!organization||organization.admin!==req.userId){
        return res.status(403).json({message:"either this org doesn't exist or you are not the admin of this org"})
    }
    res.json({
        members:organization.members.username
    })
})

app.delete("/members",middleware,async (req,res)=>{
    const organizationid=req.body.organizationid
    const memberUsername=req.body.memberUsername
    const organization=await organizationmodel.findOne({
        _id:organizationid
    })
    if(!organization||organization.admin.toString()!==req.userId){
        return res.status(411).json({message:"Either this org doesnt exist or you are not the admin of this org"})
    }
    const memberuser=await usermodel.findOne({
        username:memberUsername
    })
    if(!memberuser){
        return res.status(411).json({message:"No user with this username"})
    }
    await organizationmodel.updateOne({
        _id:organizationid
    },{
        $pullAll:{
            "members":[memberuser._id]
        }
    })
    res.json({
        message:"User deleted"
    })
})

app.listen(3000)