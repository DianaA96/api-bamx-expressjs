const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
const {Delivery, Warehouse} = require('./database');

const {DB}  = require('./database')

//lista de entregas
router.get('/a', async (req, res, next) => {
    const { idReceiver } = req.params
    let fechaDeHoy = new Date().toJSON()
    DB.query(
        `select u.nombre,w.nombre,u2.nombre,u2.apellidoP,placa,cantidad
        from
        users u join receivers r on u.idUser=r.idReceiver
        join warehouses w using(idReceiver)
        join warehousesAssignations wa using(idWarehouse)
        join assignedQuantities using(idWarehousesAssignation)
        join drivers o on o.idDriver= wa.idWarehousesAssignation
        join users u2 on u2.idUser=o.idDriver
        join collections c on c.idCollection=o.idDriver
        join vehicles on vehicles.idVehicle=c.idCollection`
        //where
       // fecha="${fechaDeHoy}" and idReceiver=:idReceiver`
       ,
        { 
            eplacements: {idReceiver: idReceiver},
            type: QueryTypes.SELECT
        }
        ).then((entregas) => {
            return res.status(200).json({
                entregas
            });
        }).catch((err) => {
            next(err);
        })
    }
)

module.exports = router