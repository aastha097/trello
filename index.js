require('dotenv').config()
const express=require('express')
const jwt=require('jsonwebtoken')
const cors=require('cors')
const bcrypt=require('bcrypt')
const {organizationmodel,usermodel,boardsmodel,issuemodel}=require('./models')

const app=express()
app.use(express.json())
app.use(cors({ 
  origin: [
    'http://localhost:3001', 
    'https://trello-1-n1kc.onrender.com/'
  ], 
  credentials: true 
}))



app.post("/signup",async (req,res)=>{
    const username=req.body.username
    const password=req.body.password

    const userexists=await usermodel.findOne({username:username})

    if(userexists){
        return res.status(411).json({
            message:"user with this username already exists"
        })
    }

    const hashedpassword=await bcrypt.hash(password,10)

    await usermodel.create({
        username:username,
        password:hashedpassword
    })

    res.json({
        message:"You have signed up"
    })
})


app.post("/signin",async (req,res)=>{
    const username=req.body.username
    const password=req.body.password

    const userexists=await usermodel.findOne({
        username:username
    })

    if(!userexists){
        return res.status(403).json({
            message:"Incorrect credentials"
        })
    }

    const passwordmatch=await bcrypt.compare(
        password,
        userexists.password
    )

    if(!passwordmatch){
        return res.status(403).json({
            message:"Incorrect credentials"
        })
    }

    const token=jwt.sign({
        userId:userexists._id
    },process.env.JWT_SECRET)

    res.json({
        token
    })
})


function middleware(req,res,next){
    const token=req.headers.token

    if(!token){
        return res.status(403).send({
            message:"You are not logged in"
        })
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        const userId=decoded.userId

        if(userId){
            req.userId=userId
            next()
        }else{
            res.status(403).json({
                message:"Token was incorrect"
            })
        }

    }catch(err){
        return res.status(403).json({
            message:"Token was incorrect"
        })
    }
}


//authenticated route
app.post("/organization",middleware,async (req,res)=>{
    const userId=req.userId

    const organization=await organizationmodel.create({
        title:req.body.title,
        description:req.body.description,
        admin:userId,
        members:[]
    })

    res.json({
        message:"org created",
        id:organization._id
    })
})

//owner allowed to add members to his organization
//get userid from middleware and check if the user is admin of the organization
//get organizationid which of his organization he wants to add member to
//get memberusername he wants to add to his organization
app.post("/add-member-to-organization",middleware,async (req,res)=>{
    const userId=req.userId
    const organizationId=req.body.organizationId
    const memberusername=req.body.memberusername

    const organization=await organizationmodel.findById(organizationId)

    if(!organization||organization.admin.toString()!==userId.toString()){
        return res.status(411).json({
            message:"Either this org doesnt exist or you are not the admin of this org"
        })
    }

    const memberuser=await usermodel.findOne({
        username:memberusername
    })

    if(!memberuser){
        return res.status(411).json({
            message:"No user with this username exists in our db"
        })
    }

    const memberexists=organization.members.find(
        id=>id.toString()===memberuser._id.toString()
    )

    if(memberexists){
        return res.status(411).json({
            message:"Member already added in organizations."
        })
    }

    organization.members.push(memberuser._id)

    await organization.save()

    res.json({
        message:"New member added!"
    })
    
})


//CREATE BOARD
//anyone who is registered and has organization
//find does (stops at the first match).some() returns a plain boolean
app.post("/board",middleware,async (req,res)=>{
    const title=req.body.title
    const organizationId=req.body.organizationId

    const organization=await organizationmodel.findById(organizationId)

    if(!organization){
        return res.status(404).json({
            message:"Organization not found"
        })
    }

    const ismember=organization.members.some(
        member=>member.toString()===req.userId.toString()
    )

    const isadmin=organization.admin.toString()===req.userId.toString()

    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access to this org"
        })
    }

    const board=await boardsmodel.create({
        title:title,
        organizationId:organizationId
    })

    res.json({
        message:"Board created",
        board:board
    })
})

//CREATE ISSUE
app.post("/issue",middleware,async (req,res)=>{
    const title=req.body.title
    const description=req.body.description
    const boardId=req.body.boardId
    const assignedTo=req.body.assignedTo

    const board=await boardsmodel.findById(boardId)

    if(!board){
        return res.status(404).json({
            message:"Board not found"
        })
    }

    const organization=await organizationmodel.findById(
        board.organizationId
    )

    const ismember=organization.members.some(
        member=>member.toString()===req.userId.toString()
    )

    const isadmin=organization.admin.toString()===req.userId.toString()

    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access to this board"
        })
    }

    const issue=await issuemodel.create({
        title:title,
        description:description,
        status:"TODO",
        boardId:boardId,
        createdBy:req.userId,
        assignedTo:assignedTo
    })

    res.json({
        message:"Issue created",
        issue:issue
    })
})


//GET ORGANIZATION
app.get("/organization",middleware,async (req,res)=>{
    const userId=req.userId
    const organizationId=req.query.organizationId

    const organization=await organizationmodel.findById(organizationId)

    if(!organization){
        return res.status(404).json({
            message:"Organization does not exist"
        })
    }

    const ismember=organization.members.some(
        member=>member.toString()===userId.toString()
    )
 
    const isadmin=organization.admin.toString()===userId.toString()

    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access to this organization"
        })
    }

    const members=[]

    for(let memberId of organization.members){
        const user=await usermodel.findById(memberId)

        if(user){
            members.push({
                id:user._id,
                username:user.username
            })
        }
    }

    res.json({
        organization:{
            id:organization._id,
            title:organization.title,
            description:organization.description,
            admin:organization.admin,
            members:members
        }
    })
})


//REMOVE MEMBER
app.delete("/members",middleware,async (req,res)=>{
    const organizationId=req.body.organizationId
    const memberusername=req.body.memberusername

    const organization=await organizationmodel.findById(organizationId)

    if(!organization||organization.admin.toString()!==req.userId.toString()){
        return res.status(411).json({
            message:"Either this org doesnt exist or you are not the admin of this org"
        })
    }

    const memberuser=await usermodel.findOne({
        username:memberusername
    })

    if(!memberuser){
        return res.status(411).json({
            message:"No user with this username"
        })
    }

    const memberexists=organization.members.some(
        member=>member.toString()===memberuser._id.toString()
    )

    if(!memberexists){
        return res.status(411).json({
            message:"This user is not a member"
        })
    }

    organization.members=organization.members.filter(
        member=>member.toString()!==memberuser._id.toString()
    )

    await organization.save()

    res.json({
        message:"User removed successfully"
    })
})


//GET BOARDS
app.get("/boards",middleware,async (req,res)=>{
    const organizationId=req.query.organizationId

    const organization=await organizationmodel.findById(organizationId)

    if(!organization){
        return res.status(404).json({
            message:"Organization not found"
        })
    }

    const ismember=organization.members.some(
        member=>member.toString()===req.userId.toString()
    )

    const isadmin=organization.admin.toString()===req.userId.toString()

    //3rd user cannot access boards
    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access to this org"
        })
    }

    const allboards=await boardsmodel.find({
        organizationId:organizationId
    })

    res.json({
        allboards
    })
})


//GET MEMBERS
app.get("/members",middleware,async (req,res)=>{
    const organizationId=req.query.organizationId

    const organization=await organizationmodel.findById(organizationId)

    if(!organization||organization.admin.toString()!==req.userId.toString()){
        return res.status(403).json({
            message:"either this org doesn't exist or you are not the admin of this org"
        })
    }

    const members=[]

    for(let memberId of organization.members){
        const user=await usermodel.findById(memberId)

        if(user){
            members.push({
                id:user._id,
                username:user.username
            })
        }
    }

    res.json({
        members:members
    })
})


//GET ISSUES
app.get("/issues",middleware,async (req,res)=>{
    const boardId=req.query.boardId

    const board=await boardsmodel.findById(boardId)

    if(!board){
        return res.status(404).json({
            message:"Board not found"
        })
    }

    const organization=await organizationmodel.findById(
        board.organizationId
    )

    const ismember=organization.members.some(
        member=>member.toString()===req.userId.toString()
    )

    const isadmin=organization.admin.toString()===req.userId.toString()

    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access to this board"
        })
    }

    const issues=await issuemodel.find({
        boardId:boardId
    })

    res.json({
        issues
    })
})

//UPDATE ISSUE
app.put("/issues",middleware,async (req,res)=>{
    const issueId=req.body.issueId

    const issue=await issuemodel.findById(issueId)

    if(!issue){
        return res.status(404).json({
            message:"Issue not found"
        })
    }

    const board=await boardsmodel.findById(issue.boardId)

    const organization=await organizationmodel.findById(
        board.organizationId
    )

    const ismember=organization.members.some(
        member=>member.toString()===req.userId.toString()
    )

    const isadmin=organization.admin.toString()===req.userId.toString()

    if(!ismember&&!isadmin){
        return res.status(403).json({
            message:"You do not have access"
        })
    }

    if(req.body.title!==undefined){
        issue.title=req.body.title
    }

    if(req.body.description!==undefined){
        issue.description=req.body.description
    }

    if(req.body.status!==undefined){
        issue.status=req.body.status
    }

    if(req.body.assignedTo!==undefined){
        issue.assignedTo=req.body.assignedTo
    }

    await issue.save()

    res.json({
        message:"Issue updated successfully",
        issue:issue
    })
})


app.listen(3000)