const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
const {Donor, CollectedQuantity} =require('./database');
const {Collection} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const {DB}  = require('./database')

// OBTIENE LA LISTA DE DONADORES PARA POBLAR EL ITEM DONADOR
router.get('/donorsselect', ( req, res, next ) => {
    DB.query(
        `select nombre, idDonor
        from 
        donors where deletedAt is NULL`,
        { nest:true,type: QueryTypes.SELECT})
    .then((listaDonadores) => {
        let donadores = []
        for(let i = 0; i < listaDonadores.length; i++) {
            donadores.push({value: listaDonadores[i].idDonor, label: listaDonadores[i].nombre})
        }

        return res.status(200).json({
            donadores
            });
        })
    .catch((err) => {
        next(err);
        })
})

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
                    name: "Not found",
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
                name: "Not found",
                message: `Ya existe un donador con estos datos `,
            })
        }
        await Donor.create(donor).then((x) => {
            return res.status(201).json({x})
        })
    } catch(err){
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
                message: "El donador que intentas actualizar no existe"
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
    const { collected, collections } = req.body

    try {
        let recoleccion = await Collection.findByPk(idCollection)
        
        if(recoleccion) {

            await recoleccion.update(collections)
            
            if(collected.rec1){
                await CollectedQuantity.create(collected.rec1)
            }
            if(collected.rec2){
                await CollectedQuantity.create(collected.rec2)
            }
            if(collected.rec3){
                await CollectedQuantity.create(collected.rec3)
            }
            if(collected.rec4){
                await CollectedQuantity.create(collected.rec4)
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

//Eliminar Donador
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
                message: "El donador que intentas eliminar no existe"
            })
        }
    }catch(err){
        next(err);
    }
}
)

//GET todos los donadores
router.get('/', async (req, res, next) => {

    if(req.query.route){
        DB.query(
            `select
            *
            from 
            donors where deletedAt is NULL and idRoute = ${req.query.route}`,
            { nest:true,type: QueryTypes.SELECT})
        .then((listaDonadores) => {
            if(listaDonadores!=''){
                return res.status(200).json({
                    listaDonadores
                });
            }else{
                return res.status(404).json({
                    name:"Not found",
                    message: `No existen donadores asigndos a esa ruta`,
                })
            }
        }).catch((err) => {
            next(err);
        })
    }else{
        DB.query(
            `select
            *
            from 
            donors where deletedAt is NULL`,
            { nest:true,type: QueryTypes.SELECT})
        .then((listaDonadores) => {
            if(listaDonadores!=''){
                return res.status(200).json({
                    listaDonadores
                });
            }else{
                return res.status(404).json({
                    name:"Not found",
                    message: `Aun no tienes donadores registrados`,
                })
            }
        })
        .catch((err) => {
            next(err);
            })
        }
    } 
)

module.exports = router