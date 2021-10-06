const express = require('express');
const router = express.Router();
const {QueryTypes} = require('sequelize');
const {Routes} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database')

//obtiene todo los usuarios
router.get('/', async (req, res, next) => {
    DB.query(
        `SELECT * FROM routes`,
        { type: QueryTypes.SELECT})
    .then((collection) => {
        return res.status(200).json({
            collection
        });
    })
    .catch((err) => {
        next(err);
    })
}
)

router.post('/donors', async (req, res, next) => {
    console.log(req.body)
    const { routes } = req.body
    try {
        let unidad = await Routes.findOne({
            where: {placa: routes.placa},
            where: {poliza: routes.poliza}
        })
        if(unidad){
            return res.status(400).json({
                message: "Ya existe una una ruta",
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

//patch OERADORES 
router.patch('/:idUser/operators/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, driver } = req.body;

    try{
        let usuario = await User.findByPk(idUser)
        let operador = await Driver.findByPk(idUser)
    
        if(usuario && operador) {
            await usuario.update(user)
            await operador.update(driver)
            
            let {
                idUser,
                nombre,
                apellidoP,
                apellidoM,
                nombreUsuario,
                telefono,
                email
            } = usuario

            let {licencia,  vencimientoLic}= operador

            return res.status(200).json({
                usuarioActualizado: {
                    idUser,
                    nombre,
                    apellidoP,
                    apellidoM,
                    nombreUsuario,
                    telefono,
                    email
                },
                operadorActualizado:{
                    licencia,  
                    vencimientoLic
                }
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

module.exports = router;