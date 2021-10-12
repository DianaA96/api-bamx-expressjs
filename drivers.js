// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes, Sequelize} = require('sequelize');
const router = express.Router();
const {DB}  = require('./database')

// ASIGNAR RUTAS DE RECOLECCIÓN. [GET]. OBTIENE LA LISTA DE LOS USUARIOS A LOS QUE NO SE LES HAN
// ASIGNADO RUTAS DE RECOLECCIÓN
router.get('/', async (req, res, next) => {

    let fechaDeHoy = new Date()

    if(req.query.name) {
        DB.query(
        `
        select
        u.nombre,apellidoM,apellidoP,o.idDriver
        from
        users u join drivers o on u.idUser=o.idDriver
        where
        o.idDriver in
        (select 
        o.idDriver
        from 
        drivers o left join collections c on o.idDriver=c.idDriver
        where c.idDriver is null or ((date(fechaRecoleccion) != '${fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')}') and fechaRecoleccion is not null))
        and nombre LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoP LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoM LIKE "%${req.query.name}%"
        `, { type: Sequelize.QueryTypes.SELECT }
        )
        .then((listaUsuarios) => {
            return res.status(200).json({
                listaUsuarios
            });
        })
        .catch((err) => {
            next(err);
        })
    }
    
    else if(req.query.order) {
        DB.query(
            `select
            u.nombre,apellidoM,apellidoP,o.idDriver
            from
            users u join drivers o on u.idUser=o.idDriver
            where
            o.idDriver in
            (select 
            o.idDriver
            from 
            drivers o left join collections c on o.idDriver=c.idDriver
            where c.idDriver is null or ((date(fechaRecoleccion) != '${fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')}') and fechaRecoleccion is not null))
            order by nombre ${req.query.order};
            `, { type: Sequelize.QueryTypes.SELECT }
            )
            .then((listaUsuarios) => {
                return res.status(200).json({
                    listaUsuarios
                });
            })
            .catch((err) => {
                next(err);
            })
    }

    else{
        DB.query(
            `select
            u.nombre,apellidoM,apellidoP,o.idDriver
            from
            users u join drivers o on u.idUser=o.idDriver
            where
            o.idDriver in
            (select 
            o.idDriver
            from 
            drivers o left join collections c on o.idDriver=c.idDriver
            where c.idDriver is null or ((date(fechaRecoleccion) != '${fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')}') and fechaRecoleccion is not null))
            `, { type: Sequelize.QueryTypes.SELECT }
            )
            .then((listaUsuarios) => {
                return res.status(200).json({
                    listaUsuarios
                });
            })
            .catch((err) => {
                next(err);
            })
    }
})

// GET bodegas asignadas
router.get('/assignedWarehouses/:idDriver', async (req, res, next) => {
    const { idDriver } = req.params
    let fechaDeHoy = new Date()
    DB.query(
        `select
        u.nombre,w.nombre,cp,municipio,colonia,calle,numExterior,cantidad
        from users u join drivers o on u.idUser=o.idDriver
        join warehousesAssignations wa using(idDriver)
        join warehouses w using(idWarehouse)
        join assignedQuantities aq on aq.idWarehousesAssignation=wa.idWarehousesAssignation
        where fecha="${fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')}" and idDriver=:idDriver`,
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