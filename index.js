const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors= require("cors");
require("dotenv").config();
const app = express();
app.use(bodyparser.json());
app.use(cors());
//---------MIDDLEWARE


//---------------------

//---------------AUTHENTICATION_PROCESS----------------
function generateUserAccessToken(data) {
  return jwt.sign(data, process.env.USER_TOKEN);
}

function generateAdminAccessToken(data) {
  return jwt.sign(data, process.env.ADMIN_TOKEN);
}
// \/ this is a middleware use it in the app.[methods] routes for eneble authentication
function authenticateUserToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
console.log("token "+token)
  if (token == null) return res.sendStatus(401)

  jwt.verify(token,process.env.USER_TOKEN, (err, user) => {
    console.log("verify eoor "+err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}


//-----------------------------------
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
console.log(token)
  if (token == null) return res.sendStatus(401)

  jwt.verify(token,process.env.ADMIN_TOKEN, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}





//-----------------------------------

authenticateOparetorToken=()=>{}
//========DATABASECONNECT====

mongoose.connect(process.env.DB_URL,{useNewUrlParser: true, useUnifiedTopology: true},(err,res)=>{console.log(err+"________"+res)});

//===========================

//++++++++SCHEMA+++++++
const usersSH = mongoose.Schema(
{
user_phone:{type:String},
user_email:String,
password:{type:String,required:true,min:6},
user_status:{type:Number,default:1}
})

const user_infoSH = mongoose.Schema(
{
user_id:{type:String,required:true},
user_name:{type:String,required:true},
user_about:{type:String,required:true},
user_state:{type:String},
user_image:{type:String,default:"https://api.minimalavatars.com/avatar/random/png"},
user_city:{type:String,required:true},
user_pin:{type:String},
user_address1:{type:String,required:true},
user_address2:{type:String}

})

const post_subcategorySH = mongoose.Schema(
{

post_subcategory_name:{type:String,required:true},
post_parent_catagory:{type:String,required:true},
subcategory_post_count:{type:Number}

})
const post_categorySH = mongoose.Schema(
{
post_category_name:{type:String,required:true},
category_post_count:{type:Number}

})
const postSH = mongoose.Schema(
{
post_category:{type:String,required:true},
post_subcategory:{type:String,required:true},
post_status:{type:String,default:0},
post_date:{type:Date,default:Date.now},
post_user_id:{type:String,required:true},
post_featured:{type:Number,default:0},
post_location:{type:String,required:true},
fields:{type:String},
boost_id:{type:String},
port_title:{type:String,required:true},
post_image:[{type: String,required:true}],
post_sold:{type:String,default:0},
post_price:{type:String,required:true},
post_description:{type:String,required:true},
auth_name:{type:String,required:true},

})
const messageSH = mongoose.Schema(
{
sender_id:{type:String,required:true},
message:{type:String,required:true},
reciver_id:{type:String,required:true},
time:{type:Date,default:Date.now},

})
const locationSH = mongoose.Schema(
{
location_name:{type:String,required:true},

})
const input_typeSH = mongoose.Schema(
{
type:Number,
type_name:String
})
const fieldsSH = mongoose.Schema(
{
  post_field_name:String

})
const boostSH = mongoose.Schema(
{


boost_category:{type:String,required:true},
boost_subcategory:{type:String,required:true},
boost_title:{type:String,required:true},
boost_regprice:{type:String,required:true},
boost_discprice:{type:String,required:true},
boost_duration:{type:Number,required:true},
boost_activecount:{type:Number},

})
const adminSH = mongoose.Schema(
{


admin_phone:{type:String},
admin_email:{type:String,required:true},
admin_password:{type:String,required:true},
admin_name:{type:String,required:true},
admin_status:{type:Number,default:0},
admin_role:{type:Number,default:1},

})
const wishlistSH = mongoose.Schema(
{

wish_user_id:{type:String,required:true},
wish_product_id:{type:String,required:true},
wish_date:{type:Date,default:Date.now},
})

const field_infoSH = mongoose.Schema(
{
  field_info_category :{type:String,required:true},
  field_info_subcategory:{type:String,required:true},
  field_info_field :{type:String,required:true},
  field_info_type:{type:String,required:true},
  field_info_data:{type:String,required:true},
  })

//===========DATABASEMODEL===
//const Ticket=mongoose.model("Ticket",ticketschema);
const message=mongoose.model("message",messageSH);
const field_info=mongoose.model("field_info",messageSH);
const fields=mongoose.model("fields",messageSH);
const boost=mongoose.model("boost",boostSH);
const location=mongoose.model("location",locationSH);
const post=mongoose.model("post",postSH);
const post_category=mongoose.model("post_category",post_categorySH);
const post_subcategory=mongoose.model("post_subcategory",post_subcategorySH);
const input_type=mongoose.model("input_type",input_typeSH);
const users=mongoose.model("users",usersSH);
const user_info=mongoose.model("user_info",user_infoSH);
const wishlist=mongoose.model("wishlist",wishlistSH);
const admin=mongoose.model("admin",adminSH);

//const nMessage=mongoose.model("nMessage",normalMessage);
//===========================


//========================

app.get("/user/getprofile/phone/:phonenumber",async (req,res)=>{

const data=await users.find({user_phone:req.params.phonenumber}).limit(1)
console.log(data)
res.status(200).json(data)
})

//==============
app.get("/user/getprofile/email/:email",async (req,res)=>{

const data=await users.find({user_phone:req.params.email}).limit(1)
console.log(data+"   "+req.params.email)
res.status(200).json(data)
})
//================
app.post("/user/register",async(req,res)=>{

const dataToBeUploaded=new users(req.body)
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})


//===================use this endpoint to login and geting token for user=======

app.get("/userlogin/:user_id",(req,res)=>{
 res.status(200).json({token:"Bearer "+generateUserAccessToken({user_id:req.params.user_id})})

})
//====================================
app.get("/adminlogin/:admin_id",(req,res)=>{
 res.status(200).json({token:"Bearer "+generateAdminAccessToken({user_id:req.params.admin_id})})

})


//=================user token code end===========

//fetured ad section========

// app.get("/user/fetured/ads/category/:category",async()=>{

// const data=await post_category.find({post_category:req.params.category,post_featured:1})
// console.log(data+"   "+req.params.email)
// res.status(200).json(data)



// })

//========================================


app.post("/user/newprofile/:user_id",authenticateUserToken,async(req,res)=>{
if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new user_info(req.body)
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})


//==================

app.post("/user/editprofile/:user_id", authenticateUserToken ,async (req,res)=>{
if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
try{
 const updated=await user_info.findByIdAndUpdate(req.params.user_id, req.body)
res.status(200).json({"close_ticket_success":updated})
}catch(err){res.status(405).json({Error:err.message})}

})

//=============

app.post("/user/addprofilepicture/:user_id", authenticateUserToken ,async (req,res)=>{
if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
try{
 const updated=await user_info.findByIdAndUpdate(req.params.user_id, {user_image:req.body.user_image})
res.status(200).json({"close_ticket_success":updated})
}catch(err){res.status(405).json({Error:err.message})}

})


//=========================
app.get("/user/all/category",async(req,res)=>{

const data=await post_category.find()
console.log(data)
res.status(200).json(data)

})

//=======================
app.get("/user/all/subcategory/:category",async(req,res)=>{

const data=await post_subcategory.find({post_parent_catagory:req.params.category})
console.log(data)
res.status(200).json(data)

}) 

//=========================

app.get("/user/getMyads/:user_id",authenticateUserToken, async(req,res)=>{
if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})

const data=await post.find({post_user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})
//==========================
app.get("/user/ads/bycategory/:category", async(req,res)=>{

const data=await post.find({post_category:req.params.category})
console.log(data)
res.status(200).json(data)

})
//==========================

app.get("/user/ads/bysubcategory/:subcategory", async(req,res)=>{

const data=await post.find({post_subcategory:req.params.subcategory})
console.log(data)
res.status(200).json(data)

})
//==========================
app.get("/user/ads/bylocation/:location", async(req,res)=>{

const data=await post.find({post_location :req.params.location})
console.log(data)
res.status(200).json(data)

})
//==========================
app.post("/user/ads/filterbylocation", async(req,res)=>{

const data=await post.find({
  post_location :req.body.location,
  post_category:req.body.category,
  post_subcategory:req.body.subcategory})
console.log(data)
res.status(200).json(data)

})
//==========================

app.post("/user/ads/filterbyprice", async(req,res)=>{

const data=await post.find({
  post_location :req.body.location,
  post_category:req.body.category,
  post_subcategory:req.body.subcategory,
  post_price:{$gte: req.body.minval, $lte: req.body.maxval}

})
console.log(data)
res.status(200).json(data)

})
//==========================
app.post("/user/add/to/wishlist",authenticateUserToken,async(req,res)=>{
if(req.user.user_id != req.body.wish_user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new wishlist(req.body)
try{

  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)

}catch(err){
  res.status(400).json({error:err.message})
}


})


//===========================
app.post("/user/create/new/ad",authenticateUserToken,async(req,res)=>{

if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new post(req.body)
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})








// //just for testing
// app.get("/test/:offset",async (req,res)=>{

//   const data=await Ticket.find().skip(req.params.offset).limit(5)
//   console.log(data)
//   res.status(200).json(data)
// })

// app.get("/test",async (req,res)=>{

//   const data=await Ticket.find()//.skip(req.params.offset).limit(5)
//   console.log(data)
//   res.status(200).json(data)
// })
// //testing end



// //===================== use this endpoint when trying to get all the tickets for a perticular user by user_id as a parameter.
// app.get("/ticket/:user_id", authenticateUserToken, async(req,res)=>{
// 	if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
// try{
//   console.log(req.params.user_id)
//   const data= await Ticket.find({user_id:req.params.user_id}).sort({createdAt:-1})


// if(data.length>0){
//   res.status(200).json(data)
// }
// else {
//   res.json({data:0})
// }
// }
// catch(err){
//   res.status(400).json({error:err.message})
// }
// })

// //===========use this endpoint when creating new tickets for a user_id and respective oparetor_id

// app.post("/newTicket",authenticateUserToken, async (req,res)=>{
// if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
// if(req.body.isclosed || req.body.closedate) return res.status(400).json({error:"Can not create a new ticket because isclosed is true or closedate is mentioned"});
// const dataToBeUploaded=new Ticket(req.body)
// try{
//   const saved_data=await dataToBeUploaded.save()
//   res.status(200).json(saved_data)
// }catch(err){
//   res.status(400).json({error:err.message})
// }



// })


// //========CLOSE TICKET BY TICKED ID===========
// app.post("/close_ticket/:ticket_id", authenticateUserToken ,async (req,res)=>{
// if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
// try{
// 	const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { isclosed: 1,closedate:Date.now() })
// res.status(200).json({"close_ticket_success":updated})
// }catch(err){res.status(405).json({Error:err.message})}

// })

// //=======UPDATE STATUS OF TICKED BY TICKET ID======

// app.post("/update_status/:ticket_id",authenticateOparetorToken,async (req,res)=>{
// if(req.user.user_id != req.body.oparetor_id) return res.status(403).json({Error:"not the same oparetor logged in"})
// try{
// 	const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { status: req.body.status});
// res.status(200).json({"status_update_success":updated})
// }catch(err){res.status(405).json({Error:err.message})}

// })



// //=========THIS IS FOR oparetor===========================

// app.get("/allTickets/:myopid",authenticateOparetorToken,async(req,res)=>{
// if(req.user.user_id != req.params.myopid) return res.status(403).json({Error:"not the same oparetor loged in"})

// const alldatas= await Ticket.find({oparetor_id:req.params.myopid})
// res.status(200).json(alldatas)


// })

// app.post("/sendmessage/:opid",authenticateOparetorToken,async(req,res)=>{
// console.log(req.user.user_id)
// console.log(req.params.opid)
// if(req.user.user_id != req.params.opid) return res.status(403).json({Error:"not the same oparetor loged in"})

//   const dataToBeUploaded=new Message({oparetor_id:req.params.opid,message:req.body.message})
// const saveddata=await dataToBeUploaded.save()
// res.status(200).json(saveddata)
// })



// app.get("/getMessage/:opid",authenticateOparetorToken,async(req,res)=>{
// if(req.user.user_id != req.params.opid) return res.status(403).json({Error:"not the same oparetor loged in"})

// if(req.params.opid){
// return res.status(200).json(await Message.find({oparetor_id:req.params.opid}).sort({time:-1}))//.exec((err, docs) => { ... })

// }
// res.status(400).json({error:"no data"})//.exec((err, docs) => { ... })


// })

// //====================this is for admin==============


// app.get("/admin/allTickets/:opid",authenticateAdminToken,async(req,res)=>{
// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})

// const alldatas= await Tickets.find({oparetor_id:req.params.myopid})
// res.status(200).json(alldatas)


// })

// app.post("/update_status/:ticket_id",authenticateAdminToken,async (req,res)=>{
// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})
// try{
// 	const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { status: req.body.status});
// res.status(200).json({"status_update_success":updated})
// }catch(err){res.status(405).json({Error:err.message})}

// })


// app.get("/admin/allTickets",authenticateAdminToken,async(req,res)=>{
// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})

// const alldatas= await Tickets.find()
// res.status(200).json(alldatas)


// })



// app.post("/admin/sendmessage/:opid",authenticateAdminToken,async(req,res)=>{

// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})

//   const dataToBeUploaded=new Message({oparetor_id:req.params.opid,message:req.body.message})
// const saveddata=await dataToBeUploaded.save()
// res.status(200).json(saveddata)
// })

// app.get("/admin/getMessage",authenticateAdminToken,async(req,res)=>{
// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})

// res.status(200).json(await Message.find().sort({time:-1}))//.exec((err, docs) => { ... })

// })

// app.get("/admin/getMessage/:opid",authenticateAdminToken,async(req,res)=>{
// if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same admin logged in"})

// if(req.params.opid){
// return res.status(200).json(await Message.find({oparetor_id:req.params.opid}).sort({time:-1}))//.exec((err, docs) => { ... })

// }
// res.status(400).json({error:"no data"})//.exec((err, docs) => { ... })


// })




//================================================
// app.post("/messageTo/:reciverid",async(req,res)=>{
// const dataToBeUploaded=new nMessage(
// {reciver_id:req.params.reciverid,
// sender_id:req.body.sender_id,
// message:req.body.message
// })
// const saveddata=await dataToBeUploaded.save()
// res.status(200).json(saveddata)
// })
// app.get("/getAllMessageFor/:recid",async(req,res)=>{
// res.status(200).json(await nMessage.find({reciver_id:req.params.recid}).sort({time:-1}))//.exec((err, docs) => { ... })
// })
// app.post("/getMessageFor/:id",async(req,res)=>{
// res.status(200).json(await nMessage.find({sender_id:req.body.sender_id,reciver_id:req.params.id}).sort({time:-1}))//.exec((err, docs) => { ... })
// })



app.get("/",(req,res)=>{res.status(200).json(
{ok:true,
"/test":"GET use this for geting all and every data just for testing",
"/ticket/user_id":"GET use this to fecth all tickets fro a perticular user like http://domain.com/ticket/user1234",
"/newTicket": "POST use this to create a new ticket you must pass user_id , oparetor_id, issue_type,description in the POST BODY ",
"/close_ticket/ticket_id":"POST use this to close the ticket by ticket id which you will get at the time of creating a new ticket no  request body is required. ",
"/update_status/ticket_id":"POST this for updating the working status of the tickit by id of the ticket like in progress,working,done like that. BODY is required in there status must be defined as json like {status:'in progress'}",
"/allTickets/my_oparetor_id":"GET use this for oparetor app where oparetor will get all the list of tickets for him with this api. ",
"/sendmessage/oparetor_id":"POST this is to send message BODY is must JSON like {message:'some message you want'}, we have to use this wisely like with this one api we will make send message and get replies. so to do that we can implement something like oparetor call /sendmessgae with his oparetor_id it will be stored in the message database then for replying to this message admin also send a messgae to that perticular oparetor id so we will store this and show that by sorting with cretion time."



})})





//=============================


app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})




//  lsof -i :3000 ---->>  kill -9 PID
