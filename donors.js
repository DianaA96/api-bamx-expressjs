const express = require('express');
const router = express.Router()
const {QueryTypes} = require('sequelize');
const {Donor} = require('./database');
// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const {DB}  = require('./database')

//TODOS LOS DONADORES
router.get('/', async (req, res, next) => {
    DB.query(
        `select
        idDonor,nombre,cp,estado,colonia,calle,numExterior,contacto
        from 
        donors`,
        { type: QueryTypes.SELECT})
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

//Donador especifico
router.get('/:idDonor', async (req, res, next) => {
    const { idDonor } = req.params;
    DB.query(
        `select
        idDonor,nombre,cp,estado,colonia,calle,numExterior,contacto
        from 
        donors
        where
        idDonor = :idDonor`,
        { replacements:{ idDonor: idDonor},
            type: QueryTypes.SELECT})
    .then((donador) => {
        return res.status(200).json({
            donador
        });
    })
    .catch((err) => {
        next(err);
    })
}
)

// crear donadores
router.post('/', async (req, res, next) => {
    console.log(req.body)
    const { donor } = req.body
    try {
        let donador = await Donor.findOne({
            where: {determinante: donor.determinante}
        })
        if(donador){
            return res.status(400).json({
                message: `Ya existe un donador con estos datos `,
            })
        }
        let donante =  await Donor.create(donor)
        return res.status(201).json({donante})
    } catch(err) 
    {
        next(err);
    }
    }
)

//patch DONADOR  * BUG DE CONTACTOTELEFONO
router.patch('/:idDonor', async (req, res, next) => {

    const { idDonor } = req.params;
    const { donor } = req.body;
    
    (DB.query(`select
    nombre
    from
    donors
    where
    idDonor=:idDonor;`,
    { 
        replacements:{ idDonor: idDonor},
        type: QueryTypes.SELECT
    }
    ))
    try{
        let a =await Donor.findByPk(idDonor)
        
        if(a) {
            await a.update(donor)         
            let {
                nombre,
                cp,
                estado,
                colonia,
                calle,
                numExterior,
                telefono
            } = a

            return res.status(200).json({
                usuarioActualizado: {
                    nombre,
                    cp,
                    estado,
                    colonia,
                    calle,
                    numExterior,
                    telefono
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



module.exports = router
