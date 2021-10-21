const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
var moment = require('moment-timezone');
const {Delivery, DeliveredQuantity, Receiver, WarehousesAssignation} = require('./database');

const {DB}  = require('./database')

// GET lista de entregas
router.get('/:idReceiver', async (req, res, next) => {
    const { idReceiver } = req.params

    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')

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
        join vehicles on vehicles.idVehicle=c.idCollection
        where fecha='${fechaDeHoy}' and  idReceiver=:idReceiver`,
        { 
            replacements: {idReceiver: idReceiver},
            type: QueryTypes.SELECT
        }
        ).then((entregas) => {
            if(entregas!=''){
                return res.status(200).json({
                    entregas
                })
            }else{
                return res.status(400).json({
                    name: "Not found",
                    message: "No tienes entregas proximas"
                })
            }
        }).catch((err) => {
            next(err);
        })
    }
)

//AGREGAR POST DE MODIFICACION DONATIVO RECEPTOR :()
router.post('/', async (req, res, next)=>{
    const {delivery} = req.body;
    const {delivered} = req.body;
    try{
        let c = await Receiver.findOne({where:{idReceiver:delivery.idReceiver}})
        let b = await WarehousesAssignation.findByPk(delivery.idWarehousesAssignation)
        if(c&&b){
        await Delivery.create(delivery)
        .then(async (a)=>{
            await DeliveredQuantity.create(
                {idDelivery: a.idDelivery,
                idCategory: delivered.ent1.idCategoria,
                cantidad: delivered.ent1.cantidad}
                )
            if(delivered.ent2){
                await DeliveredQuantity.create(
                    {idDelivery: a.idDelivery,
                    idCategory: delivered.ent2.idCategoria,
                    cantidad: delivered.ent2.cantidad}
                    )
            }
            if(delivered.ent3){
                await DeliveredQuantity.create(
                    {idDelivery: a.idDelivery,
                    idCategory: delivered.ent3.idCategoria,
                    cantidad: delivered.ent3.cantidad}
                    )
            }
            if(delivered.ent4){
                await DeliveredQuantity.create(
                    {idDelivery: a.idDelivery,
                    idCategory: delivered.ent4.idCategoria,
                    cantidad: delivered.ent4.cantidad}
                    )
            }
            
            return res.status(200).json({
                    entrega: delivery,
                    entregado1: delivered.ent1,
                    entregado2: delivered.ent2,
                    entregado3: delivered.ent3,
                    entregado4: delivered.ent4
            })
        })
        }else{
                return res.status(400).json({
                    name: "Not found",
                    message: "La bodega o el Receptor asignado no existe."
                })
            }
    }catch(err) {
        next(err)
    }
})

module.exports = router