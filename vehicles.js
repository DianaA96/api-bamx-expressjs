// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes} = require('sequelize');
const router = express.Router();
const {Vehicle} = require('./database');

const {DB}  = require('./database');

//OBTIENE TODAS LAS UNIDADES
router.get('/', async (req, res, next) => {
        DB.query(
            `SELECT idVehicle,placa,poliza, vencimientoPoliza FROM vehicles`,
            { type: QueryTypes.SELECT})
        .then((listaVehicles) => {
            return res.status(200).json({
                listaVehicles
            });
        })
        .catch((err) => {
            next(err);
        })
    }
)

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
        let carro =  await Vehicle.create(vehicle)
        return res.status(201).json({carro})
    } catch(err) 
    {
        next(err);
    }
    }
)

//datos unidad 
router.get('/:idVehicle',async (req, res, next) => {
    const { idVehicle } = req.params;
    Vehicle.findByPk(idVehicle)
    .then ((vehicle) => {
            if(vehicle) {
                const { idVehicle, placa, poliza, vencimientoPoliza } = vehicle;
                const datosVehiculo = { idVehicle, placa, poliza, vencimientoPoliza}
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

//patch OERADORES 
router.patch('/:idVehicle/', async (req, res, next) => {

    const { idVehicle } = req.params;
    const { vehicle } = req.body;

    try{
        let troka = await Vehicle.findByPk(idVehicle)
      
        if(troka) {
            await troka.update(vehicle)
            let {
                placa,
                poliza,
                vencimientoPoliza
            } = troka

            return res.status(200).json({
                updateTroka: {
                    placa,
                    poliza,
                    vencimientoPoliza
                }
            })
        } else {
            return res.status(404).json({
                name: "Not Found",
                message: "La unidad que intentas actualizar no existe"
                })
            }
        } catch(err) {
            next(err);
        }
    }
)

//FALTA ELIMINAR UNIDAD

module.exports = router
