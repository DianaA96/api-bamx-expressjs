const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
const {Delivery, Categorie, DeliveredQuantity} = require('./database');

const {DB}  = require('./database')

// GET lista de entregas
router.get('/:idReceiver', async (req, res, next) => {
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
        join vehicles on vehicles.idVehicle=c.idCollection
        where fecha="${fechaDeHoy}" and  idReceiver=:idReceiver`
       ,
        { 
            replacements: {idReceiver: idReceiver},
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

//AGREGAR POST DE MODIFICACION DONATIVO RECEPTOR :()
router.post('/', async (req, res, next)=>{
    const {delivery} = req.body;
    const {delivered} = req.body;
    console.log(delivered.ent1.cantidad)
    try{
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
        }).catch((err) => {
            next(err);
        })
    }catch(err) {
        next(err)
    }
})


module.exports = router