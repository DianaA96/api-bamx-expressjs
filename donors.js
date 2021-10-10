const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
const {Donor, CollectedQuantity} =require('./database');
const {Collection} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const {DB}  = require('./database')

//GET todos los donadores
router.get('/', async (req, res, next) => {
    DB.query(
        `select
        *
        from 
        donors where deletedAt is NULL`,
        { nest:true,type: QueryTypes.SELECT})
    .then((listaDonadores) => {
        return res.status(200).json({
            listaDonadores
            });
        })
    .catch((err) => {
        next(err);
        })
    }
)

// GET donador especifico
router.get('/:idDonor', async (req, res, next) => {
    const { idDonor } = req.params;
    DB.query(
        `select
        *
        from 
        donors
        where deletedAt is NULL and idDonor = :idDonor`,
        { 
            replacements:{ idDonor: idDonor},
            type: QueryTypes.SELECT
        })
        .then((donador) => {
            if(donador!=''){
                return res.status(200).json({
                    donador
                });
            }
            else{
                return res.status(404).json({
                    message: `No existe un donador con esta información`,
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    }
)

// POST donador
router.post('/', async (req, res, next) => {
    console.log(req.body)
    const {donor} = req.body
    try {
        let donador = await Donor.findOne({
            where: {determinante: donor.determinante}
        })
        let mismadireccion = await Donor.findOne({
            where: {
                cp: donor.cp,
                estado:donor.estado,
                municipio: donor.municipio,
                colonia:donor.colonia,
                calle:donor.calle,
                numExterior: donor.numExterior
            }
        })
        if(donador || mismadireccion){
            return res.status(400).json({
                message: `Ya existe un donador con estos datos `,
            })
        }
        console.log(donor)
        await Donor.create(donor).then((x) => {
            return res.status(201).json({x})
        })
    } catch(err) 
    {
        next(err);
    }
    }
)

// PATCH donador  
router.patch('/:idDonor', async (req, res, next) => {

    const { idDonor } = req.params;
    const { donor } = req.body;
    try{
        let a =await Donor.findByPk(idDonor)
        
        if(a) {
            await a.update(donor)         
            let {
                nombre,
                determinante,
                cp,
                estado,
                municipio,
                colonia,
                calle,
                numExterior,
                telefono,
                correo,
                tipo
            } = a

            return res.status(200).json({
                usuarioActualizado: {
                    nombre,
                    determinante,
                    cp,
                    estado,
                    municipio,
                    colonia,
                    calle,
                    numExterior,
                    telefono,
                    correo,
                    tipo
                },
            })
        } else {
            return res.status(404).json({
                name: "Not Found",
                message: "El operador que intentas actualizar no existe"
                })
            }
        } catch(err) {
            next(err);
        }
    }
)

// Formulario registro recolección (modal) 
router.patch('/collected/collections', async(req, res, next) => {
    
    const { thisCollection: idCollection } = req.query
    const { collected } = req.body
    console.log(collected)

    try {
        let recoleccion = await Collection.findByPk(idCollection)
        
        if(recoleccion) {
            await recoleccion.update(req.body.body)
            console.log(recoleccion);
            if(collected.rec1){
                await CollectedQuantity.create(rec1)
            }
            if(collected.rec2){
                await CollectedQuantity.create(rec2)
            }
            if(collected.rec3){
                await CollectedQuantity.create(rec3)
            }
            if(collected.rec4){
                await CollectedQuantity.create(rec4)
            }
            return res.status(200).json({
                recoleccionActualizada: recoleccion,
                cantidad1: collected.rec1,
                cantidad2: collected.rec2,
                cantidad3: collected.rec3,
                cantidad4: collected.rec4
            })
        } else {
            return res.status(404).json({
                name: "Not Found",
                message: "La recolección que intentas modificar no se ha creado aún :("
            })
        }
    } catch(err) {
        next(err);
    }
})

//eliminar Usuarios
router.delete('/:idDonor', async (req, res, next)=>{
    const {idDonor} = req.params;
    try{
        let donador = await Donor.findByPk(idDonor)
        if(donador){
            await donador.destroy(/*{force: true}*/)
            return res.status(200).json({
                donadorEliminado: donador
            })
        }else{
            return res.status(404).json({
                name: "Not found",
                message: "El donador que intenas eliminar no existe"
            })
        }
    }catch(err){
        next(err);
    }
}
)

module.exports = router