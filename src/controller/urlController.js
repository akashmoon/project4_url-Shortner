const shortid = require("shortid");
const urlModel = require("../model/urlModel");

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

    if (!/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%.\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.~#?&//=]*)/g.test(longUrl)) 
    {
      return res.status(400).send({status: false,message: "Invalid URL Format",});
    }

    const baseUrl = "http://localhost:3000";

    let urlCode = shortid.generate().toLowerCase()
      
    let url = await urlModel.findOne({ longUrl });
    if (url) {
      return res.status(404).send({ status: false, msg: "Url is already exist" });
    }

    const shortUrl = baseUrl + "/" + urlCode;
    const urlData = { urlCode, longUrl, shortUrl };
    const newurl = await urlModel.create(urlData);

    let currentUrl = {
      urlCode: newurl.urlCode,
      longUrl: newurl.longUrl,
      shortUrl: newurl.shortUrl,
    };
    return res.status(201).send({ data: currentUrl });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, msg: "Server Error" });
  }
};

const geturl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    if (!urlCode) {
      res.status(400).send({ status: false, msg: "please provide UrlCode" });
    }

    let checkUrl = await urlModel.findOne({ urlCode });
    if (!checkUrl) {
      return res.status(404).send({ status: false, msg: "Invalid UrlCode" });
    } else {
      return res.redirect(307, checkUrl.longUrl);
    }
  } catch (error) {}
};

module.exports = {
  createurl,
  geturl,
};