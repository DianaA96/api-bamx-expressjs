// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes} = require('sequelize');
const router = express.Router();
const {DB}  = require('./database')

router.get('/', async (req, res, next) => {
        DB.query(
            `SELECT * FROM drivers where deletedAt is NULL`,
            { type: QueryTypes.SELECT})
        .then((listaOperadores) => {
            return res.status(200).json({
                listaOperadores 
            });
        })
        .catch((err) => {
            next(err);
        })
    }
)

router.get('/assignedWarehouses/:idDriver', async (req, res, next) => {
    const { idDriver } = req.params
    let fechaDeHoy = new Date().toJSON()
    DB.query(
        `select
        u.nombre,w.nombre,cp,municipio,colonia,calle,numExterior,cantidad
        from users u join drivers o on u.idUser=o.idDriver
        join warehousesAssignations wa using(idDriver)
        join warehouses w using(idWarehouse)
        join assignedQuantities aq on aq.idWarehousesAssignation=wa.idWarehousesAssignation
        where fecha="${fechaDeHoy}" and idDriver=:idDriver`,
        { 
            replacements: {idDriver:idDriver},
            type: QueryTypes.SELECT
        }
    )
    .then((listaEntregas) => {
        return res.status(200).json({
            listaEntregas 
        });
    })
    .catch((err) => {
        next(err);
    })
}
)


module.exports = router