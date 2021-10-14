const express = require('express');
const { QueryTypes } = require('sequelize');
const cors = require('cors') //npm install cors
const bodyParser = require ('body-parser'); //npm install  --save body-parser
const app = express();
const port = process.env.PORT || 5000;

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
const { DB, Driver, CollectedQuantity, Collection, User, Categorie }  = require('./database')

app.listen(port, () => {
    console.log (`Server is running on port ${port}`)
});

// Lista Recolección. Este endpoint consulta las recolecciones asignadas
app.get('/collections/driver', (req, res, next) => {

    const { thisDriver: idEmployee } = req.query
    let fechaDeHoy = new Date()

    // Raw SQL Query
    DB.query(
        `
        select 
        u.nombre,fechaRecoleccion,idCollection, d.nombre,d.idDonor,cp,estado,municipio,colonia,calle,numExterior
        from
        users u join drivers o on u.idUser = o.idDriver
        join collections using (idDriver)
        join donors d using (idDonor)
        where
        idDriver= ${parseInt(idEmployee)} and (recolectado=0 or recolectado is null) and date(fechaAsignacion) = '${(fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')).slice(0,10)}'
        `,
        { type: QueryTypes.SELECT })
        .then((queryResult) => {
            return res.status(200).json({
                data: queryResult
            })
        }
        )
        .catch ((err) => {
            next(err);
        })
    }
)

// Lista Recolecciones hechas. Este endpoint consulta las recolecciones realizadas
app.get('/collections/done/driver', (req, res, next) => {

    const { thisDriver: idEmployee } = req.query
    let fechaDeHoy = new Date()

    // Raw SQL Query
    DB.query(
        `
        select 
        u.nombre,fechaRecoleccion, idCollection,d.nombre,d.idDonor,cp,estado,municipio,colonia,calle,numExterior
        from
        users u join drivers o on u.idUser = o.idDriver
        join collections using (idDriver)
        join donors d using (idDonor)
        where
        idDriver= ${parseInt(idEmployee)} and recolectado=1 and date(fechaAsignacion) = '${(fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')).slice(0,10)}'
        `,
        { type: QueryTypes.SELECT })
        .then((queryResult) => {
            return res.status(200).json({
                data: queryResult
            })
        }
        )
        .catch ((err) => {
            next(err);
        })
    }
)


// FALTA IMPLEMENTAR LA FECHA DE HOY

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

//  Endpoint que consulta la asignación de ruta de entrega del operador
// GET asignar rutas de entrega
app.get('/assigneddeliveries/:idReceiver', async (req, res, next) => {

    const {idReceiver} = req.params;
    let fechaDeAyer = new Date((new Date()). valueOf() - 1000*60*60*24)

    try {
        // Raw SQL Query
        let driverData = await DB.query(
            `select
            distinct o.idDriver,u.nombre as operador,u.apellidoP,u.apellidoM,cantidad as cantidadAEntregar,categories.nombre as categoria
            from
            users u join drivers o on u.idUser=o.idDriver
            join warehousesAssignations wa using(idDriver)
            join deliveries using(idWarehousesAssignation)
            join deliveredQuantities using(idDelivery)
            join categories using(idCategory)
            join collections c on c.idDriver=o.idDriver
            join vehicles using(idVehicle)
            where date(fecha)='${(fechaDeAyer.toISOString().slice(0, 19).replace('T', ' ')).slice(0,10)}' and
            idReceiver=${parseInt(idReceiver)}
            `,
            { type: QueryTypes.SELECT })
        
        let idChofer = -1
        let chofer = {
            idDriver: '',
            operador: '',
            apellidoP: '',
            apellidoM: '',
            entregas: []
        }
        let aux

        for (let i = 0; i < driverData.length; i++) {
            if(idChofer !== driverData[i].idDriver) {
                idChofer = driverData[i].idDriver
                aux = await DB.query(
                    `select
                    distinct o.idDriver,u.nombre as operador,u.apellidoP,u.apellidoM,cantidad as cantidadAEntregar,categories.nombre as categoria
                    from
                    users u join drivers o on u.idUser=o.idDriver
                    join warehousesAssignations wa using(idDriver)
                    join deliveries using(idWarehousesAssignation)
                    join deliveredQuantities using(idDelivery)
                    join categories using(idCategory)
                    join collections c on c.idDriver=o.idDriver
                    join vehicles using(idVehicle)
                    where date(fecha)='2021-10-09' and
                    idReceiver=1
                    `, 
                    { type: QueryTypes.SELECT })
                    
                    chofer.idDriver = aux[0].idDriver
                    chofer.operador = aux[0].operador
                    chofer.apellidoP = aux[0].apellidoP
                    chofer.apellidoM = aux[0].apellidoM
                    
            } else {
                aux = await DB.query(
                    `select
                    distinct cantidad as cantidadAEntregar,categories.nombre as categoria
                    from
                    users u join drivers o on u.idUser=o.idDriver
                    join warehousesAssignations wa using(idDriver)
                    join deliveries using(idWarehousesAssignation)
                    join deliveredQuantities using(idDelivery)
                    join categories using(idCategory)
                    join collections c on c.idDriver=o.idDriver
                    join vehicles using(idVehicle)
                    where date(fecha)='2021-10-09' and
                    idReceiver=1
                    `, 
                    { type: QueryTypes.SELECT })
                    console.log(aux)
                    chofer.entregas = (aux)
            }
        }

        if(chofer){
            return res.status(200).json({
                chofer
            })
        } else {
            return res.status(400).json({
                message: "No hay registros coincidentes"
            })
        }

    } catch(err) 
    {
        next(err);
    }
}
)

//TQM coladera de errores
app.use((err, req, res, next)=>{
    return res.status(500).json({
        "name": err.name,
        "message": `${err.message}, ${err.original ? err.original : ':('}`,
    })
})
