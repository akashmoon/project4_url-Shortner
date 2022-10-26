const shortid = require("shortid");
const urlModel = require("../model/urlModel");

//--------------------Redis----------------------------------------
const redis=require("redis")
const {promisify}=require("util")

//-----------------------Connection setup--------------------------

const redisClient = redis.createClient(

  // 17993,
  // "redis-17993.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  // { no_ready_check: true }
  16524,
  "redis-16524.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("AF4bibcEGYYeLlGva4x47QtUs5xriHsE", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const isValid = function (value) {
  if (typeof value === "undefined" || typeof value === "null") {
    return false;
  }
  if (value.trim().length == 0) {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const createurl = async function (req, res) {
  try {
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({status: false, message: "Invalid request parameters. Please provide URL details",});
     }
    
    if (!isValid(req.body.longUrl)) {
      return res.status(400).send({ status: false, message: " Please provide LONG URL" });
    }

    const longUrl = req.body.longUrl.trim();

    if (!/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})?$/.test(longUrl))
    {
      return res.status(400).send({status: false,message: "Invalid URL Format",});
    }

    const baseUrl = "http://localhost:3000";

    let urlCode = shortid.generate().toLowerCase()
      
    let url = await urlModel.findOne({ longUrl }).select({longUrl : 1, urlCode : 1, shortUrl: 1, _id: 0});
    if (url) {
      return res.status(201).send({ status: true,msg:"success" ,data:url});
    }

    const shortUrl = baseUrl + "/" + urlCode;
    const urlData = { urlCode, longUrl, shortUrl };
    const newurl = await urlModel.create(urlData);

    let currentUrl = {
      urlCode: newurl.urlCode,
      longUrl: newurl.longUrl,
      shortUrl: newurl.shortUrl,
    };
    return res.status(201).send({status:true, msg:"success", data: currentUrl });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, msg: "Server Error" });
  }
};

const geturl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;

    let cachedData = await GET_ASYNC(`${urlCode}`)
        if (cachedData) {

            console.log("comming from redis",cachedData)
            let changed = JSON.parse(cachedData)
            return res.status(302).redirect(changed.longUrl)
        }

    let checkUrl = await urlModel.findOne({ urlCode });
    if (!checkUrl) {
      return res.status(404).send({ status: false, msg: "url not found" });
    } 
    await SET_ASYNC(`${urlCode}`, JSON.stringify(checkUrl))
    return res.status(302).redirect(checkUrl.longUrl);
   
    
  } catch (error) {}
};

module.exports = {
  createurl,
  geturl,
};