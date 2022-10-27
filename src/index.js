const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const  mongoose  = require('mongoose');


const app = express(); 

app.use(bodyParser.json());


mongoose.connect("mongodb+srv://akashmoon:akash_moon@cluster0.xvaineh.mongodb.net/project3_shoppingCart?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
}) 