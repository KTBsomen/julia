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
user_status:{type:Number,default:1},
post_available:{type:Number,default:3}
})

const mopeSH = mongoose.Schema(
{
  user_id:String,
order_id:{type:String},
txnId:String
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
fields:{type:String,required:true},
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
boost_category:{type:String,required:true},
boost_subcategory:{type:String,required:true},
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
  post_ids:[{type:String,required:true,default:""}]
  })

const boost_purchaseSH = mongoose.Schema(
{
  plan_id :[{type:String,required:true}],
  user_id:{type:String,required:true},
  end_date:{type:Date,required:true},
  purchase_date:{type:Date,default:Date.now},
  post_ids:{type:String,required:true}
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
const boost_purchase=mongoose.model("boost_purchase",boost_purchaseSH);
const extrafield=mongoose.model("extrafield",extrafieldSH);
const mope=mongoose.model("mope",mopeSH);

//const nMessage=mongoose.model("nMessage",normalMessage);
//===========================


//========================

app.get("/user/getprofile/phone/:phonenumber",async (req,res)=>{

try{const data=await users.find({user_phone:req.params.phonenumber}).limit(1)
console.log(data[0]._id)
res.status(200).json(data)}
catch(err){
 return res.status(400).json({error:err.message})

}
})

//==============
app.get("/user/getprofile/email/:email/:password",async (req,res)=>{
try{
const data=await users.find({user_email:req.params.email}).limit(1)
if(typeof data[0] !="undefined"){
  if(data[0].password!=req.params.password){return res.status(400).json({error:"password not matched..."})}
 return res.status(200).json({user_id:data[0]._id,token:"Bearer "+generateUserAccessToken({user_id:data[0]._id})})
}
else{
  console.log("this block is runnning")
  const dataToBeUploaded=new users({user_email:req.params.email,password:req.params.password})
      try{
      const saved_data=await dataToBeUploaded.save()
         return res.status(200).json({user_id:saved_data._id,token:"Bearer "+generateUserAccessToken({user_id:saved_data. _id})})
      }catch(err){
         res.status(400).json({error:err.message})
      }

}}catch(err){ res.status(400).json({error:err.message})}


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
boost_category:req.body.boost_category,
boost_subcategory:req.body.boost_subcategory,
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


app.post("/admin/new/boost/plan",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds

const dataToBeUploaded=new boost({

boost_category:req.body.boost_category,
boost_subcategory:req.body.boost_subcategory,
boost_title:req.body.boost_title,
boost_regprice:req.body.boost_regprice,
boost_discprice:req.body.boost_discprice,
boost_duration:parseInt(req.body.boost_duration)* 24 * 60 * 60000,
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
//============================
app.post("/user/build/order/",async(req,res)=>{
const data=new mope({user_id:req.body.user_id, order_id:"ord"+Math.floor(Math.random()*1000000)})
var saveddata=await data.save()//.find({user_id:req.params.user_id})


  try{
var total=0
var len=req.body.plan_id
if(typeof len=="string"){len=new Array(len)}
console.log(len)
for (var i = 0; i < len.length; i++) {
  console.log(len[i])
 const data=await packege.find({_id:len[i]})
console.log(data)

 total+=parseInt(data[0].disprice)
}

}catch(err){return res.status(400).json(err.message)}
var axiosbody={
description: len.toString(),
amount: total*100,
order_id:saveddata._id,
currency: "SRD",
redirect_url: `http://localhost:3000/mope/redirect/url/${saveddata._id}/${req.body.user_id}`
}
try{
var result_data=await axios.post("https://api.mope.sr/api/shop/payment_request",axiosbody,
  {headers:{'Content-Type': 'application/json;charset=UTF-8',
  "Authorization": "Bearer test_3a98758e3b711e693280a184a57d8efcb304611820d60748b23c20157a"}  })
console.log(result_data.data)
await mope.findByIdAndUpdate(saveddata._id,{txnId:result_data.data.id})
res.status(200).json({data:result_data.data,total:total,nop:len.length})
}catch(err){console.log({error:err.message})}
})

//=============================
app.post("/user/purchase/packege",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds
res.status(403).json("Not here use site to view ")

})
//=============================

app.post("/user/build/boost",async(req,res)=>{

const data=new mope({user_id:req.body.user_id, order_id:"ord"+Math.floor(Math.random()*1000000)})
var saveddata=await data.save()//.find({user_id:req.params.user_id})
var packegeList=req.body.boost;


   httpdata=await axios("http://localhost:3000/user/boost/"+packegeList)

   var axiosbody={
description: req.body.boost.toString(),
amount: httpdata.data[0].boost_discprice*100,
order_id:saveddata._id,
currency: "SRD",
redirect_url:`http://localhost:3000/mope/boost/redirect/url/${saveddata._id}/${req.body.user_id}/${req.body.post_id}/${req.body.boost}`
}



// res.send(`total post available: ${total_post_available}  end date total ${new Date(end_date_total)>Date.now()}`)

try{

var result_data=await axios.post("https://api.mope.sr/api/shop/payment_request",axiosbody,
  {headers:{'Content-Type': 'application/json;charset=UTF-8',
  "Authorization": "Bearer test_3a98758e3b711e693280a184a57d8efcb304611820d60748b23c20157a"}  })
console.log(result_data.data)
await mope.findByIdAndUpdate(saveddata._id,{txnId:result_data.data.id})
res.status(200).json({data:result_data.data})



}catch(err){return res.status(400).json(err.message)}




})




//=============================
app.get("/mope/boost/redirect/url/:order_id/:user_id/:post_id/:boost",async(req,res)=>{
//if(req.user.user_id != req.body.admin_id) return res.status(403).json({Error:"not the same user loged in"})
//1 day = 1 * 24 * 60 * 60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds

try{
const txnId=await mope.find({_id:req.params.order_id})
console.log(`txn_id==${txnId[0].txnId}`)
httpdata=await axios(`https://api.mope.sr/api/shop/payment_request/${txnId[0].txnId}`, {headers:{'Content-Type': 'application/json;charset=UTF-8',
  "Authorization": "Bearer test_3a98758e3b711e693280a184a57d8efcb304611820d60748b23c20157a"}  })
console.log(httpdata.data)
//res.status(200).json({"data":httpdata.data})
try{
  var bodydata=JSON.stringify((httpdata.data.description).split(","))
}catch(err){bodydata=JSON.stringify(new Array(httpdata.data.description))}
console.log(bodydata)
if(httpdata.data.status=="paid"){

try{
  var checking=await post.find({_id:req.params.post_id})
  var post_subcategory=checking[0].post_subcategory
}catch(err){}


 try{ 
  var end_date_total=Date.now();
  var purchase_date=Date.now();
  const datax=await boost_purchase.find({user_id:req.params.user_id})

  for (var i = 0; i < datax.length; i++) {
    
   if(new Date(datax[i].end_date)>end_date_total && datax[i].post_ids==req.params.post_id){
end_date_total=new Date(datax[i].end_date).getTime()
purchase_date=datax[i].end_date
   }
  }

console.log("purchase_date"+purchase_date)
  var packegeList=req.params.boost;


   httpdata=await axios("http://localhost:3000/user/boost/"+packegeList)

   end_date_total+=parseInt(httpdata.data[0].boost_duration);
   console.log("httpdata")

   console.log(httpdata.data[0])


   if(httpdata.data[0].boost_subcategory!=post_subcategory){return res.status(400).json({"Not the same sub category":httpdata[0].boost_subcategory})}
}catch(err){return res.status(400).json({error:err.message})}

// res.send(`total post available: ${total_post_available}  end date total ${new Date(end_date_total)>Date.now()}`)




              const dataToBeUploaded=new boost_purchase({ 
              user_id:req.params.user_id,
              plan_id:packegeList,
              end_date:end_date_total,
              purchase_date:purchase_date,
              post_ids:req.params.post_id
              })




              try{
                const saved_data=await dataToBeUploaded.save()


                try{
               const updated=await post.findByIdAndUpdate(req.params.post_id, {post_featured:1})
              //res.status(200).json({"post featured sucessfully":updated})
                }catch(err){res.status(405).json({Error:err.message})}


                return res.status(200).json(saved_data)
              }catch(err){
                return res.status(400).json({error:err.message})
              }








}


}catch(err){return res.status(400).json(err.message)}




 })

app.patch("/update/database",async(req,res)=>{
const datax=await boost_purchase.find({end_date:{$lte:Date.now()}})
for (var i = 0; i < datax.length; i++) {
var data=await post.findByIdAndUpdate(datax[i].post_ids, {post_featured:0})
res.json(data)
}
})

//=========================
app.get("/mope/redirect/url/:order_id/:user_id",async(req,res)=>{
  try{
const txnId=await mope.find({_id:req.params.order_id})
console.log(`txn_id==${txnId[0].txnId}`)
httpdata=await axios(`https://api.mope.sr/api/shop/payment_request/${txnId[0].txnId}`, {headers:{'Content-Type': 'application/json;charset=UTF-8',
  "Authorization": "Bearer test_3a98758e3b711e693280a184a57d8efcb304611820d60748b23c20157a"}  })
console.log(httpdata.data)
//res.status(200).json({"data":httpdata.data})
try{
  var bodydata=JSON.stringify((httpdata.data.description).split(","))
}catch(err){bodydata=JSON.stringify(new Array(httpdata.data.description))}
console.log(bodydata)
if(httpdata.data.status=="paid"){


 try{ var packegeList=JSON.parse(bodydata);
  var total_post_available=0;
  var end_date_total=Date.now();
  for (var i = packegeList.length - 1; i >= 0; i--) {
   httpdata=await axios("http://localhost:3000/user/plan/"+packegeList[i])
   total_post_available+=parseInt(httpdata.data[0].post_available); 
   end_date_total+=parseInt(httpdata.data[0].duration);
  }
}catch(err){return res.status(400).json({error:err.message})}
// res.send(`total post available: ${total_post_available}  end date total ${new Date(end_date_total)>Date.now()}`)

const dataToBeUploaded=new plan_purchase({ 
user_id:req.params.user_id,
plan_id:packegeList,
post_available:total_post_available,
end_date:end_date_total
})
try{
  const saved_data=await dataToBeUploaded.save()
 return res.status(200).json(saved_data)
}catch(err){
 return res.status(400).json({error:err.message})
}



//let httpdatas=await axios.post("http://localhost:3000/user/purchase/packege",{user_id:req.params.user_id,packeges:bodydata})
//res.status(200).json({"purchase_sucess":httpdata.data,"packeges":httpdatas.data})





}

}catch(err){res.status(400).json({"error":err.message})}
})



//=========================
app.get("/user/my/packege/:user_id",async(req,res)=>{

const data=await plan_purchase.find({user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})
//=========================
app.get("/user/get/order_id",async(req,res)=>{

const data=new mope({order_id:"ord"+Math.floor(Math.random()*1000000)})
var saveddata=await data.save()//.find({user_id:req.params.user_id})

res.status(200).json({order_id:saveddata._id})

})
//=========================
app.get("/user/my/boost/:user_id",async(req,res)=>{

const data=await boost_purchase.find({user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})

//=========================

app.get("/user/all/plans",async(req,res)=>{

const data=await packege.find()
console.log(data)
res.status(200).json(data)

})
//=========================

app.get("/user/all/boost/plans/:subcategory",async(req,res)=>{

const data=await boost.find({boost_subcategory:req.params.subcategory})
console.log(data)
res.status(200).json(data)

})
//=============================
app.get("/user/boost/:boost_id",async(req,res)=>{

const data=await boost.find({_id:req.params.boost_id})
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

const data=await post.find().skip(req.params.offset).limit(10)
console.log(data)
res.status(200).json(data)

})
//=========================

app.get("/user/ads/:ad_id",async(req,res)=>{
try{
const data=await post.find({_id:req.params.ad_id})
console.log(data)
res.status(200).json(data)
}catch(err){res.json(0)}
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
try{let check=await wishlist.find({wish_user_id:req.params.wish_user_id,
  wish_product_id:req.params.wish_product_id})

if(check[0]._id){console.log('id exists');return res.status(400).json({wish_id:check[0]._id,error:"already added to wishlist"})}
}
catch(err){}
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
//==========================
app.get("/user/remove/from/wishlist/:wish_user_id/:wish_id",async(req,res)=>{
//if(req.user.user_id != req.params.wish_user_id) return res.status(403).json({Error:"not the same user loged in"})

try{
 const updated=await wishlist.findByIdAndDelete(req.params.wish_id)
res.status(200).json({"DELETEed":updated})
}catch(err){res.status(405).json({Error:err.message})}

})

//===========================
app.get("/user/my/wishlist/:user_id",async(req,res)=>{
//if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})


const data=await wishlist.find({wish_user_id:req.params.user_id})
console.log(data)
res.status(200).json(data)

})
//===========================
app.get("/user/is/in/wishlist/:wish_user_id/:wish_product_id",async(req,res)=>{
//if(req.user.user_id != req.params.user_id) return res.status(403).json({Error:"not the same user loged in"})


const data=await wishlist.find({wish_user_id:req.params.wish_user_id,wish_product_id:req.params.wish_product_id})
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
const data=await plan_purchase.find({
  user_id :req.body.post_user_id,
  post_available:{$gt: 0},
  end_date:{$gte: Date.now()},
  
})
const pa=await users.find({
 _id :req.body.post_user_id,
  post_available:{$gt: 0}
})
if(data.length && pa.length){return res.status(400).json({"No Post Left":"buy now"})}
var fetured=0;
for (var i = 0; i < data.length; i++) {

const plandetails=await packege.find({_id:data[i].plan_id})

console.log("data")
console.log(data)
console.log("plandetails")
console.log(plandetails)
try{
  //console.log(`if(${data[i]._id} && ${plandetails[0].boost_subcategory}==${req.body.post_subcategory}){${fetured}=1}`)
  if(data[i]._id ){fetured=1}//&& plandetails[0].boost_subcategory==req.body.post_subcategory
  //console.log(`2nd if(${data[i]._id} && ${plandetails[0].boost_subcategory}==${req.body.post_subcategory}){${fetured}=1}`)

}
catch(err){console.log(err.message)}
}


try{console.log(`req.body----->>>${req.body}`)}catch(ee){ console.log(`req.body----->>>${ee.messgae}`);return res.json({Error:ee.messgae})}

const dataToBeUploaded=new post({
post_category:req.body.post_category,
post_subcategory:req.body.post_subcategory,
post_user_id:req.body.post_user_id,
post_featured:fetured,
fields:req.body.fields,
post_location:req.body.location,
post_title:req.body.post_title,
post_image:JSON.parse(req.body.post_image),
post_price:req.body.post_price,
post_description:req.body.post_description,
auth_name:req.body.auth_name,

})
try{
const saved_data=await dataToBeUploaded.save()
if (fetured) {
const updated=await plan_purchase.findOneAndUpdate({
  user_id:saved_data.post_user_id,
  post_available:{$gt: 0},
  end_date:{$gte: Date.now()},


}, {

$addToSet: { post_ids: saved_data._id },
$inc: {post_available: -1}

})
}else{
  const updated=await users.findOneAndUpdate({
  _id:saved_data.post_user_id,
  post_available:{$gt: 0}

}, {
$inc: {post_available: -1}
})
}


return res.status(200).json({"post uploaded":saved_data})
}catch(err){
 return res.status(400).json({error:err.message})
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
app.post("/user/re/post", authenticateUserToken ,async (req,res)=>{
if(req.user.user_id != req.body.user_id) return res.status(403).json({Error:"not the same user loged in"})
try{
 const updated=await post.findByIdAndUpdate(req.body.post_id, {post_sold:0,createdAt:Date.now()})
res.status(200).json({"reposted":updated})
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
app.post("/user/sendmessage/:reciver_id" ,async (req,res)=>{
//if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})

const dataToBeUploaded=new message({
  reciver_id:req.params.reciver_id,
  sender_id:req.body.sender_id,
  message:req.body.message
})
try{

  const saved_data=await dataToBeUploaded.save()
  res.status(200).json(saved_data)

}catch(err){
  res.status(400).json({error:err.message})
}

})

//======================
app.post("/user/getmessage/:sender_id" ,async (req,res)=>{
//if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})
const data=await message.find({sender_id: req.params.sender_id,reciver_id:req.body.reciver_id}).limit(1).sort({ time: 'desc' })

res.status(200).json(data)

})

//======================
app.get("/user/getsenderlist/:reciver_id" ,async (req,res)=>{
//if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})
const data=await message.find({reciver_id:req.params.reciver_id}).distinct('sender_id')
console.log(data)
res.status(200).json(data)

})

//======================
app.get("/user/getallmessage/:sender_id/:reciver_id" ,async (req,res)=>{
//if(req.user.user_id != req.body.post_user_id) return res.status(403).json({Error:"not the same user loged in"})
const data1=await message.find({sender_id: req.params.sender_id,reciver_id:req.params.reciver_id})
const data2=await message.find({sender_id: req.params.reciver_id,reciver_id:req.params.sender_id})

const data=data1.concat(data2)
const sortedDesc = data.sort(
  (objA, objB) => new Date(objA.time) - new Date(objB.time),
);
console.log(sortedDesc)
res.status(200).json(sortedDesc)

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
