const express = require('express');
const chalk = require('chalk');//resaltador
const cors = require('cors') //npm install cors
const bodyParser = require ('body-parser'); //npm install  --save body-parser
const app = express();
const port = 5000;

const users = require('./users');
const donors = require('./donors');
const drivers = require('./drivers');
const vehicles = require('./vehicles');
const routes = require('./routes');

app.use (bodyParser.json());
app.use(cors());

app.use('/users', users);
app.use('/donors', donors);
app.use('/routes', routes);
app.use('/drivers', drivers);
app.use('/vehicles', vehicles);

app.listen(port, () => {
    console.log (chalk.cyanBright(`Server is running on port ${port}`))
});

// Coladera de errores-- Endpoint next
app.use((err, req, res, next)=>{
    console.error(chalk.redBright(err.stack));
    return res.status(500).json({
        "name":err.name,
        "message": `${err.message}, ${err.original ? err.original : ':('}`,
    })
})
