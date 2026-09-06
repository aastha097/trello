const mongoose=require('mongoose')
mongoose.connect("mongodb://localhost:27017/trelloapp")

const userSchema=mongoose.Schema({
    username:String,
    password:String
})

const orgSchema=mongoose.Schema({
    title:String,
    description:String,
    admin:mongoose.Types.ObjectId, //objectId('dghsdjwgjh')->mongodb type-objectId
    members:[mongoose.Types.ObjectId]//array of objectid
})

const boardSchema=mongoose.Schema({
    title:String,
    organizationId:mongoose.Types.ObjectId
})

const issueSchema=mongoose.Schema({
    title:String,
    description:String,
    status: { type: String, default: 'TODO' },
    boardId: mongoose.Types.ObjectId,
    createdBy: mongoose.Types.ObjectId,
    assignedTo: mongoose.Types.ObjectId
})

const organizationmodel=mongoose.model("organizations",orgSchema)
const usermodel=mongoose.model("users",userSchema)
const boardsmodel=mongoose.model("boards",boardSchema)
const issuemodel=mongoose.model("issues",issueSchema)

module.exports={
    organizationmodel:organizationmodel,
    usermodel:usermodel,
    boardsmodel:boardsmodel,
    issuemodel:issuemodel
}