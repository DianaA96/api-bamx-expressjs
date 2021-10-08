// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes} = require('sequelize');
const router = express.Router();
const {Vehicle} = require('./database');

const {DB}  = require('./database');

//OBTIENE TODAS LAS UNIDADES
router.get('/', async (req, res, next) => {
    DB.query(
        `SELECT idVehicle,modelo,placa,
        poliza,vencimientoPoliza 
        FROM vehicles 
        where deletedAt is NULL`,
        { type: QueryTypes.SELECT})
    .then((listaVehicles) => {
        return res.status(200).json({
            listaVehicles
        });
    }).catch((err) => {
        next(err);
    })
})

//datos unidad 
router.get('/:idVehicle',async (req, res, next) => {
    const { idVehicle } = req.params;
    Vehicle.findByPk(idVehicle)
    .then ((vehicle) => {
            if(vehicle) {
                const { modelo, placa, poliza, vencimientoPoliza } = vehicle;
                const datosVehiculo = { modelo, placa, poliza, vencimientoPoliza}
                return res.status(200).json({datosVehiculo})
            } else {
                return res.status(404).json({
                    name: "Not Found",
                    message: "La unidad introducida no existe"
                })
            }
        }) 
    .catch (
        (err) => next(err)
    )
})

// CREA UNA NUEVA TROKA
router.post('/', async (req, res, next) => {
    console.log(req.body)
    const { vehicle } = req.body
    try {
        let unidad = await Vehicle.findOne({
            where: {placa: vehicle.placa},
            where: {poliza: vehicle.poliza}
        })
        if(unidad){
            return res.status(400).json({
                message: "Ya existe una unidad con esos datos",
            })
        }
        let unidadCreada = await Vehicle.create(vehicle) 
        return res.status(201).json({unidadCreada})        
    }catch(err){
        next(err);
    }
})

//patch troka
//Actualiza una ruta
router.patch('/:idVehicle/', async (req, res, next) => {
    console.log(req.body)
    const {idVehicle}= req.params
    const {vehicle}=req.body
    try {
        let unidad = await Vehicle.findByPk(idVehicle)
        let carro = await Vehicle.findOne({
            where: {placa: vehicle.placa},
            where: {poliza: vehicle.poliza}
        })
        if(carro){
            return res.status(400).json({
                message: "Ya existe un vehiculo con estos datos",
            })
        }
        await unidad.update(vehicle).then((a) => {
           return res.status(201).json({unidad})
        })
    }catch(err){
        next(err);
    }
})

router.delete('/:idVehicle', async (req, res, next)=>{
    const {idVehicle} = req.params;
    try{
        let carro = await Vehicle.findByPk(idVehicle)
        if(carro){
            await carro.destroy(/*{force: true}*/)
            return res.status(200).json({
                UnidadEliminada: carro
            })
        }else{
            return res.status(404).json({
                name: "Not found",
                message: "La unidad seleccionada no existe"
            })
        }

    }catch(err){
        next(err);
    }
})

module.exports = router
