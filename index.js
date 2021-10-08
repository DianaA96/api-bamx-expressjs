const express = require('express');
const { QueryTypes } = require('sequelize');
const chalk = require('chalk');//resaltador
const cors = require('cors') //npm install cors
const bodyParser = require ('body-parser'); //npm install  --save body-parser
const app = express();
const port = 5000;

const users = require('./users');
const routes = require('./routes');
const donors = require('./donors');
const drivers = require('./drivers');
const vehicles = require('./vehicles');
const deliveries = require('./deliveries');

app.use (bodyParser.json());
app.use(cors());

app.use('/users', users);
app.use('/routes', routes);
app.use('/donors', donors);
app.use('/drivers', drivers);
app.use('/vehicles', vehicles);
app.use('/deliveries',deliveries);
 
// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB, Refer }  = require('./database')

app.listen(port, () => {
    console.log (chalk.cyanBright(`Server is running on port ${port}`))
});

// Lista Recolección. Este endpoint consulta las recolecciones realizadas
app.get('/collections/driver', (req, res, next) => {

    const { thisDriver: idEmployee } = req.query
    let fechaDeHoy = new Date().toJSON()

    // Raw SQL Query
    DB.query(
        `select 
        u.nombre,fechaRecoleccion,d.nombre,cp,estado,municipio,colonia,calle,numExterior
        from
        users u join drivers o on u.idUser = o.idDriver
        join collections using (idDriver)
        join donors d using (idDonor)
        where
        fechaRecoleccion= "${fechaDeHoy}" and idDriver= ${parseInt(idEmployee)} and recolectado=0;
        `,
        { type: QueryTypes.SELECT })
        .then((queryResult) => {
            return res.status(200).json({
                recolecciones: queryResult
            })
        }
        )
        .catch ((err) => {
            next(err);
        })
    }
)

//  Confirmación nota operador
app.get('/collections', (req, res, next) => {

    const { thisCollection: idCollection } = req.query

    // Raw SQL Query
    DB.query(
        `select
        folio,fechaRecoleccion,responsableEntrega,d.nombre,d.calle,cantidad
        from 
        donors d join collections c using (idDonor)
        join collectedQuantities cq using(idCollection)
        where idCollection = ${parseInt(idCollection)}
        `,
        { type: QueryTypes.SELECT })
        .then((queryResult) => {
            return res.status(200).json({
                collection: queryResult
            })
        }
        )
        .catch ((err) => {
            next(err);
        })
    }
)


//TQM coladera de errores
app.use((err, req, res, next)=>{
    console.error(chalk.redBright(err.stack));
    return res.status(500).json({
        "name":err.name,
        "message": `${err.message}, ${err.original ? err.original : ':('}`,
    })
})
