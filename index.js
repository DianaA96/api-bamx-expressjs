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
        folio,fechaRecoleccion,responsableEntrega,d.nombre,d.calle,cantidad, nota
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

    const { idReceiver } = req.params;
    let fechaDeAyer = new Date((new Date()). valueOf() - 1000*60*60*24)
    let fechaDeHoy = new Date()


    try {
        // Raw SQL Query
        let driverData = await DB.query(
            `select
            distinct o.idDriver,u.nombre as operador,u.apellidoP,u.apellidoM,cantidad as CantidadaEntregar,categories.nombre as categoria,modelo,u.nombreUsuario
            from
            users u join drivers o on u.idUser=o.idDriver
            join warehousesAssignations wa using(idDriver)
            join assignedQuantities using(idWarehousesAssignation)
            join categories using(idCategory)
            join collections c on c.idDriver=o.idDriver
            join vehicles using(idVehicle)
            join warehouses w on w.idWarehouse=wa.idWarehouse
            where date(fecha) = '${(fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')).slice(0,10)}' and
            idReceiver=${idReceiver}
            `,
            { type: QueryTypes.SELECT })
        
        let idChofer = -1
        let data = [ ]
        let auxChofer = {
            operador : '',
            apellidoP : '',
            apellidoM : '',
            nombreUsuario : '',
            modelo : '',
            pan : '',
            fruta : '',
            abarrote : '',
            noComestible : ''
        }

        for (let i = 0; i < driverData.length; i++) {
        
            if(idChofer !== driverData[i].idDriver) {
                idChofer = driverData[i].idDriver
                auxChofer.operador = driverData[i].operador
                auxChofer.apellidoP = driverData[i].apellidoP
                auxChofer.apellidoM = driverData[i].apellidoM
                auxChofer.nombreUsuario = driverData[i].nombreUsuario
                auxChofer.modelo = driverData[i].modelo
               
                for (let o = 0; o < driverData.length; o++) {

                    if(driverData[o].categoria === 'Pan' && idChofer === driverData[o].idDriver ) {
                        auxChofer.pan = driverData[o].CantidadaEntregar
                    }
                    else if (driverData[o].categoria === 'Abarrote' && idChofer === driverData[o].idDriver ) {
                        auxChofer.abarrote = driverData[o].CantidadaEntregar
                    }
                    else if (driverData[o].categoria === 'Frutas y verduras' && idChofer === driverData[o].idDriver ) {
                        auxChofer.fruta = driverData[o].CantidadaEntregar
                    }
                    else if (driverData[o].categoria === 'No comestible'&& idChofer === driverData[o].idDriver ) {
                        auxChofer.noComestible = driverData[o].CantidadaEntregar
                    } 
                }
                data.push(auxChofer)
                auxChofer = {}
            } 
        }

        if(driverData){
            return res.status(200).json({
                data
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
