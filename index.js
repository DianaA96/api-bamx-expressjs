const express = require('express');
const cors = require('cors') //npm install cors
const bodyParser = require ('body-parser'); //npm install  --save body-parser
const app = express();
const port = 5000;

const donors = require('./donors');

app.use (bodyParser.json());
app.use(cors());
app.use('/donors', donors)



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});