const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors= require("cors");
const axios = require('axios').default;
require("dotenv").config();
const app = express();
app.use(bodyparser.json());
app.use(cors());
//---------MIDDLEWARE


/** we dont need it here in api bu need it on the client side.
 * Creates a json object including fields in the form
 *
 * @param {HTMLElement} form The form element to convert
 * @return {Object} The form data
 */
const Form2JSON = (form) => {
  const data = new FormData(form);
  return Array.from(data.keys()).reduce((result, key) => {
    if (result[key]) {
      result[key] = data.getAll(key)
      return result
    }
    result[key] = data.get(key);
    return result;
  }, {});
};


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
post_title:{type:String,required:true},
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

const packegeSH = mongoose.Schema(
{
plan_name:{type:String,required:true},
duration:{type:Number,required:true},
disprice:{type:String,required:true},
post_available:{type:Number,required:true},
regprice:{type:String,required:true},


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

const reviewsSH = mongoose.Schema(
{
  post_id :{type:String,required:true},
  star_rating:{type:Number,max:5,required:true},
  review:{type:String,required:true},
  user_id:{type:String,required:true},
  review_time:{type:Date,default:Date.now},
  })

const plan_purchaseSH = mongoose.Schema(
{
  plan_id :[{type:String,required:true}],
  user_id:{type:String,required:true},
  post_available:{type:Number,required:true},
  end_date:{type:Date,required:true},
  purchase_date:{type:Date,default:Date.now},
  })

const extrafieldSH = mongoose.Schema(
{
  subcategory_id :{type:String,required:true},
  schema:{type:Object,required:true},
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
const reviews=mongoose.model("reviews",reviewsSH);
const packege=mongoose.model("packege",packegeSH);
const plan_purchase=mongoose.model("plan_purchase",plan_purchaseSH);
const extrafield=mongoose.model("extrafield",extrafieldSH);

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
//========================================


app.post("/admin/new/plan",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds

const dataToBeUploaded=new packege({
regprice:req.body.regprice,
disprice:req.body.disprice,
plan_name:req.body.plan_name,
post_available:req.body.post_available,
duration:parseInt(req.body.duration)* 24 * 60 * 60000
})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})
//========================================
app.post("/admin/new/category",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds

const dataToBeUploaded=new post_category({
post_category_name:req.body.post_category_name,
})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})

//========================================
app.post("/admin/new/subcategory",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds

const dataToBeUploaded=new post_subcategory({
post_subcategory_name:req.body.post_subcategory_name,
post_parent_catagory:req.body.post_parent_catagory
})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})


//========================================


app.post("/admin/add/extra/field",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds
try {(!JSON.parse(req.body.schema)) }
catch(err){return res.status(400).json({error:"json not formated correctly "+err.message})}
const dataToBeUploaded=new extrafield({
subcategory_id:req.body.subcategory_id,
schema:JSON.parse(req.body.schema)
})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})
//=============================
app.get("/user/extra/field/:subcategory_id",async(req,res)=>{
var formhtml='';
const data=await extrafield.find({subcategory_id:req.params.subcategory_id})
for (var i = data.length - 1; i >= 0; i--) {
try{
    if(typeof(data[i].schema)=="object"){
  
  console.log(` ${Object.keys(data[i].schema)}`)
  switch(parseInt(data[i].schema.fieldtype)){

case 5:
  console.log("date")
  formhtml+=`<div class="">
            <label for="" class="form-label"> ${data[i].schema.field} </label>
            <input id="dynamic-${data[i].schema.field}" type="date" name="${data[i].schema.field}" value="" class="form-control" required="" placeholder="voer hier de advertentietitel in">
          </div>`
  break;

case 4:
    console.log("dropdown")//onchange="document.getElementById("dynamic-dropdown").value="this.options[this.selectedIndex].value&quot;
    var arr=data[i].schema.fielddata.replace("[",'').replace("]",'').split(",")
    var options="";
    for (var k = arr.length - 1; k >= 0; k--) {
      options+=`<option value="${arr[k]}">${arr[k]}</option>`

    }
    formhtml+=(`
    <div class="col-xl-6 col-lg-6 col-md-6 col-12">
   
    <lable class="my-2 "><b>${data[i].schema.field}</b></lable>
     <select name="${data[i].schema.field}" class="form-control" required="" >
     ${options}
</select>  
          </div>

    `)


  break;


case 3:
console.log("redio")
  var arr=data[i].schema.fielddata.replace("[",'').replace("]",'').split(",")
    var options="";
    for (var k = arr.length - 1; k >= 0; k--) {
      options+=`<input type="radio" name="${data[i].schema.field}" class="" required="" value="${arr[k]}">${arr[k]}&nbsp;&nbsp;`

    }
    formhtml+=(`
    <div class="col-xl-6 col-lg-6 col-md-6 col-12">
   
    <lable class="my-2 " style="display: block;"><b>${data[i].schema.field}</b></lable>
     
     ${options}
 
          </div>

    `)


  break;

case 2:
console.log("checkbox")
var arr=data[i].schema.fielddata.replace("[",'').replace("]",'').split(",")
    var options="";
    for (var k = arr.length - 1; k >= 0; k--) {
      options+=`<input type="checkbox" name="${data[i].schema.field}" class="" required="" value="${arr[k]}">${arr[k]}&nbsp;&nbsp;`

    }
    formhtml+=(`
    <div class="col-xl-6 col-lg-6 col-md-6 col-12">
   
    <lable class="my-2 " style="display: block;"><b>${data[i].schema.field}</b></lable>
     
     ${options}
 
          </div>

    `)



  break;


case 1:
console.log("text or number")
formhtml+=`<div class="">
            <label for="" class="form-label"> ${data[i].schema.field} </label>
            <input id="dynamic-${data[i].schema.field}" type="text" name="${data[i].schema.field}" value="" class="form-control" required="" placeholder="voer hier de advertentietitel in">
          </div>`
  break;




  }


      }




}catch(err){console.log(err.message)}


}
res.status(200).send(formhtml)

})

//=============================
app.get("/user/plan/:plan_id",async(req,res)=>{

const data=await packege.find({_id:req.params.plan_id})
console.log(data)
res.status(200).json(data)

})

//=============================
app.post("/user/purchase/packege",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds
 try{ var packegeList=req.body.packeges;
  var total_post_available=0;
  var end_date_total=Date.now();
  for (var i = packegeList.length - 1; i >= 0; i--) {
   httpdata=await axios("http://localhost:3000/user/plan/"+packegeList[i])
   total_post_available+=parseInt(httpdata.data[0].post_available); 
   end_date_total+=parseInt(httpdata.data[0].duration);
  }
}catch(err){res.status(400).json({error:err.message})}
// res.send(`total post available: ${total_post_available}  end date total ${new Date(end_date_total)>Date.now()}`)

const dataToBeUploaded=new plan_purchase({ 
user_id:req.body.user_id,
plan_id:packegeList,
post_available:total_post_available,
end_date:end_date_total
})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

})
//=========================
app.get("/user/my/packege/:user_id",async(req,res)=>{

const data=await plan_purchase.find({user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})

//=========================

app.get("/user/all/plans",async(req,res)=>{

const data=await packege.find()
console.log(data)
res.status(200).json(data)

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

app.get("/user/all/ads",async(req,res)=>{

const data=await post.find()
console.log(data)
res.status(200).json(data)

})
//=========================

app.get("/user/all/ads/:offset",async(req,res)=>{

const data=await post.find().skip(req.params.offset).limit(2)
console.log(data)
res.status(200).json(data)

})
//=========================

app.get("/user/ads/:ad_id",async(req,res)=>{

const data=await post.find({_id:req.params.ad_id})
console.log(data)
res.status(200).json(data)

})
//=============================

app.get("/user/recommendation/ads",async(req,res)=>{

const data=await post.find({
  post_location :req.body.location,
  post_subcategory:req.body.subcategory,


})
console.log(data)
res.status(200).json(data)

})

//=========================
app.get("/user/all/category",async(req,res)=>{

const data=await post_category.find()
console.log(data)
res.status(200).json(data)

})

//=========================
app.get("/user/all/location",async(req,res)=>{

const data=await location.find()
console.log(data)
res.status(200).json(data)

})
//=========================
app.post("/admin/add/location",async(req,res)=>{
const dataToBeUploaded=new location({
location_name :req.body.location_name,

})
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}

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
app.get("/user/add/to/wishlist/:wish_user_id/:wish_product_id",async(req,res)=>{
//if(req.user.user_id != req.params.wish_user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new wishlist({
  wish_user_id:req.params.wish_user_id,
  wish_product_id:req.params.wish_product_id
})
try{

  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)

}catch(err){
  res.status(400).json({error:err.message})
}


})
//===========================
app.get("/user/my/wishlist/:user_id",async(req,res)=>{
//if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})


const data=await wishlist.find({wish_user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})
//===========================

app.get("/user/is/pro/:user_id", async(req,res)=>{

const data=await plan_purchase.find({
  user_id :req.params.user_id,
  post_available:{$gt: 0},
  end_date:{$gte: Date.now()},
  
})
console.log(data)
res.status(200).json(data)

})


// axios.post('/user', {
//     user_id: 'Fred',
//     lastName: 'Flintstone'
//   })



//===========================
app.post("/user/create/new/ad" ,async(req,res)=>{
//if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})
var checking_PL_ED=await axios("http://localhost:3000/user/is/pro/"+req.body.user_id)
var fetured=0
if (checking_PL_ED){
  var fetured=1
}


const dataToBeUploaded=new post({
post_category:req.body.category,
post_subcategory:req.body.subcategory,
post_user_id:req.body.user_id,
post_featured:fetured,
post_location:req.body.location,
post_title:req.body.title,
post_image:req.body.images,
post_price:req.body.price,
post_description:req.body.description,
auth_name:req.body.name,

})
try{
const saved_data=await dataToBeUploaded.save()
const updated=await plan_purchase.findOneAndUpdate(req.body.user_id, {$inc: {post_available: -1}})
res.status(200).json({"post uploaded":saved_data})
}catch(err){
  res.status(400).json({error:err.message})
}

})

//========================
app.get("/user/search/product/title/:title",async (req,res)=>{
const data=await post.find({post_title: new RegExp(req.params.title,'i')})

res.status(200).json(data)

})
//=======================

app.post("/user/write/review" ,async(req,res)=>{
//if(req.user.user_id != req.body.user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new reviews(req.body)
try{
  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)
}catch(err){
  res.status(400).json({error:err.message})
}


})
//=======================

app.get("/user/read/review/:post_id",async (req,res)=>{
const data=await reviews.find({post_id: req.params.post_id})

res.status(200).json(data)

})

//=======================

app.post("/user/related/ads", async(req,res)=>{

const data=await post.find({
  post_location :req.body.location,
  post_category:req.body.category,
  post_subcategory:req.body.subcategory,
  post_price:{$gte: req.body.minval, $lte: req.body.maxval}
})
console.log(data)
res.status(200).json(data)

})

//======================
app.post("/user/mark/sold", authenticateUserToken ,async (req,res)=>{
if(req.user.user_id != req.body.user_id) return res.status(403).json({Error:"not the same user loged in"})
try{
 const updated=await post.findByIdAndUpdate(req.body.post_id, {post_sold:1})
res.status(200).json({"Marked as sold":updated})
}catch(err){res.status(405).json({Error:err.message})}

})


//======================

app.post("/user/editpost/", authenticateUserToken ,async (req,res)=>{
if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})
try{
 const updated=await post.findByIdAndUpdate(req.body._id,req.body)
res.status(200).json({"post edited sucessfully":updated})
}catch(err){res.status(405).json({Error:err.message})}

})

//======================





















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
//  if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})
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
//  const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { isclosed: 1,closedate:Date.now() })
// res.status(200).json({"close_ticket_success":updated})
// }catch(err){res.status(405).json({Error:err.message})}

// })

// //=======UPDATE STATUS OF TICKED BY TICKET ID======

// app.post("/update_status/:ticket_id",authenticateOparetorToken,async (req,res)=>{
// if(req.user.user_id != req.body.oparetor_id) return res.status(403).json({Error:"not the same oparetor logged in"})
// try{
//  const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { status: req.body.status});
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
//  const updated=await Ticket.findByIdAndUpdate(req.params.ticket_id, { status: req.body.status});
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
