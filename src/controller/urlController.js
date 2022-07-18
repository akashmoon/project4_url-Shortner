//const validUrl = require('valid-url');
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

const validUrl = (value) => {
    if (!(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(value.trim()))) {
        return false
    }
        return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};


const createurl = async function (req, res) {

    try {

        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide URL details", });
        }
        if (!isValid(req.body.longUrl)) {
            return res.status(400).send({ status: false, message: " Please provide LONG URL" });
        }

        const longUrl = req.body.longUrl.trim();
        if (!validUrl(longUrl)) {
            return res.status(400).send({ status: false, Message: "Invalid Long Url" });
        }
        
       const baseUrl = "http://localhost:3000";

        let urlCode = shortid.generate().toLowerCase()

        let url = await urlModel.findOne({ longUrl });
        if (url) {
            return res.status(200).send({ status: true, data: url });
        }

        const shortUrl = baseUrl + "/" + urlCode;
        const urlData = { urlCode, longUrl, shortUrl };
        const newurl = await urlModel.create(urlData);
        return res.status(201).send({ status: true, msg: `URL created successfully`, data: newurl });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: false, msg: "Server Error" });
    }
};

//--------------------------GET URL---------------------------------------------------


const getUrl= async function(req,res){

    try{
        const url = req.params.urlCode.trim();
        const isUrlExist = await urlModel.findOne({ urlCode:url });
        if (isUrlExist) {
        
            if (url !== isUrlExist.urlCode) {
            return res.status(404).send({ status: false, Message: "No Url Found, Please Check Url Code", });
            }
            const data={ longUrl:isUrlExist.longUrl,
            shortUrl:isUrlExist.shortUrl,
            urlCode:isUrlExist.urlCode,
            }
           return res.status(200).send({status:true, data:data})
        }
            return res.status(404).send({ status: false, message: 'url not found please insert valid url' })

    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message });
    }
}

module.exports = {
    createurl,getUrl}

