const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors'); 
const app = express()
const fileUpload = require('express-fileupload');


app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

const db = require("./models");
db.sequelize.sync({
     //force: true // drop tables and recreate
}).then(() => {
    console.log("db resync");
});

require('./routes')(app);

app.listen(3000, function () {
    console.log('Ingrese a http://localhost:3000')
})