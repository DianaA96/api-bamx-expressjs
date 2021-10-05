const express = require('express');
const cors = require('cors') //npm install cors
const bodyParser = require ('body-parser'); //npm install  --save body-parser
const app = express();
const port = 5000;


const donors = require('./donors');
const drivers = require('./drivers');

app.use (bodyParser.json());
app.use(cors());

app.use('/donors', donors);
app.use('/drivers', drivers);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

// Coladera de errores-- Endpoint next
app.use((err, req, res, next)=>{
    console.error(err.stack);
    return res.status(500).json({
        "name":err.name,
        "message": `${err.message}, ${err.original ? err.original : ':('}`,
    })
})
