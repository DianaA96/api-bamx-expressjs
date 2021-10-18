// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes, Sequelize} = require('sequelize');
const router = express.Router();
const {DB}  = require('./database')
const {User, Driver, CollectedQuantity, Collection} = require('./database');

// ASIGNAR RUTAS DE RECOLECCIÓN. [GET]. OBTIENE LA LISTA DE LOS USUARIOS A LOS QUE NO SE LES HAN
// ASIGNADO RUTAS DE RECOLECCIÓN
router.get('/', async (req, res, next) => {

    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')

    if(req.query.name) {
        DB.query(
        `
        select
        u.nombre,apellidoM,apellidoP,nombreUsuario,o.idDriver
        from
        users u join drivers o on u.idUser=o.idDriver
        where
        o.idDriver in
        (select 
        o.idDriver
        from 
        drivers o left join collections c on o.idDriver=c.idDriver
        where c.idDriver is null or ((date(fechaRecoleccion) = '${fechaDeHoy}') and date(fechaRecoleccion) is not null))
        and nombre LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoP LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoM LIKE "%${req.query.name}%" or u.deletedAt is NULL and nombreUsuario LIKE "%${req.query.name}%"
        `, { type: Sequelize.QueryTypes.SELECT }
        )
        .then((listaUsuarios) => {
            if(listaUsuarios!=''){
                return res.status(200).json({
                    listaUsuarios
                });
            }else{
                return res.status(404).json({
                    name:"Not found",
                    message: "No hay registros coincidentes"
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    }
    
    else if(req.query.order) {
        DB.query(
            `select
            u.nombre,apellidoM,apellidoP,nombreUsuario,o.idDriver
            from
            users u join drivers o on u.idUser=o.idDriver
            where
            o.idDriver in
            (select 
            o.idDriver
            from 
            drivers o left join collections c on o.idDriver=c.idDriver
            where c.idDriver is null or ((date(fechaRecoleccion) = '${fechaDeHoy}') and date(fechaRecoleccion) is not null))
            order by nombre ${req.query.order};
            `, { type: Sequelize.QueryTypes.SELECT }
            )
            .then((listaUsuarios) => {
                if(listaUsuarios!=''){
                    return res.status(200).json({
                        listaUsuarios
                    });
                }else{
                    return res.status(404).json({
                        name: "Not found",
                        message: "No hay registros coincidentes"
                    })
                }
            })
            .catch((err) => {
                next(err);
            })
    }

    else{
        DB.query(
            `select
            u.nombre,apellidoM,apellidoP,nombreUsuario,o.idDriver
            from
            users u join drivers o on u.idUser=o.idDriver
            where
            o.idDriver in
            (select 
            o.idDriver
            from 
            drivers o left join collections c on o.idDriver=c.idDriver
            where c.idDriver is null or ((date(fechaRecoleccion) = '${fechaDeHoy}') and date(fechaRecoleccion) is not null))
            `, { type: Sequelize.QueryTypes.SELECT }
            )
            .then((listaUsuarios) => {
                if(listaUsuarios!=''){
                    return res.status(200).json({
                        listaUsuarios
                    });
                }else{
                    return res.status(404).json({
                        name: "Not found",
                        message: "No hay registros coincidentes"
                    })
                }
            })
            .catch((err) => {
                next(err);
            })
    }
})

/* // GET bodegas asignadas
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
        where fecha="${(fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')).slice(0, 10)}" and idDriver=:idDriver`,
        { 
            replacements: {idDriver:idDriver},
            type: QueryTypes.SELECT
        }
    )
    .then((listaEntregas) => {
        if(listaEntregas!=''){
            return res.status(200).json({
                listaEntregas
            });
        }else{
            return res.status(400).json({
                name: "Not found",
                message: "Este operador aun no tiene una ruta de entregas asignada"
            })
        }
    })
    .catch((err) => {
        next(err);
    })
}
) */

// GET operadores GESTIÓN DE OPERADORES EN RUTA // AÑADIR LA FECHA COMO PARÁMETRO DE BÚSQUEDA
// obtiene el nombre, nombreUsuario, idDriver y número de recolecciones COMPLETAS asignadas el día de hoy y ASIGNADAS el día de hoy
router.get('/enroutedrivers', async(req, res, next) =>{

    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')
    DB.query(
        `select
        idDriver, nombreUsuario,u.nombre,apellidoP,apellidoM,
        sum(recolectado = 1) as recolectadas,sum(recolectado = 0) as norecolectadas
        from
        users u join drivers o on u.idUser=o.idDriver
        join collections c using(idDriver)
        where 
        date(fechaAsignacion) = '${fechaDeHoy}'
        group by idDriver`, 
        { 
            type: QueryTypes.SELECT
        }
    )
    .then((choferes) => {
        if(choferes!=''){
            return res.status(200).json({
                choferes 
            });
        }else{
            return res.status(404).json({
                name:"Not found",
                message: "No hay operadores en ruta"
            })
        }
    })
    .catch((err) => {
        next(err);
    })
}
)

//FALTA IMPLEMENTAR LAS FECHAS EN ESTE ENDPOINT
// Busca un solo chofer y devuelve las recolecciones realizadas. VISTA GESTION DE OPERADORES EN RUTA
router.get('/enroutedriver/:idDriver', async(req, res, next) =>{

    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')
    
    try {
        let chofer = await DB.query(
            `select
            idDriver, nombreUsuario,u.nombre,apellidoP,apellidoM,sum(recolectado = 1) as recolectadas
            from
            users u join drivers o on u.idUser=o.idDriver
            join collections c using(idDriver)
            where 
            fechaRecoleccion is null
            and idDriver = ${req.params.idDriver}`, 
            { 
                type: QueryTypes.SELECT
            }
        )

        let recoleccionesRealizadas = await DB.query(
            `select
            idDriver,idCollection, nombreUsuario,u.nombre,apellidoP,apellidoM, folio, responsableEntrega, fechaRecoleccion, nota, d.nombre as donador, longitud, latitud
            from
            users u join drivers o on u.idUser=o.idDriver
            join collections c using(idDriver)
            join donors d using(idDonor)
            where 
            fechaRecoleccion is not null and recolectado = 1
            and idDriver = ${req.params.idDriver}`, 
            { 
                type: QueryTypes.SELECT
            }
        )
        
        if(chofer) {
            return res.status(200).json({
                chofer, recoleccionesRealizadas
            })
        } else {
            return res.status(404).json({
                message: "El chofer que buscas no existe"
            })
        }

    } catch(err) {
        next(err);
    }
}
)

// ENDPOINT QUE MUESTRA TODAS LAS CANTIDADES RECOLECTADAS POR NOTA EN VISTA
// SEGUIMIENTO DE OPERADORES EN RUTA
//FALTA IMPLEMENTAR FECHAS
router.get('/collectedquantitiespernote/:idCollection', async(req, res, next) =>{
    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')
    
    try {

        let notas =
            {
                fruta: '',
                abarrote: '',
                pan: '',
                noComestible: ''
            }

        let notasQuery = await DB.query(
            `select
            cq.idCategory, cq.cantidad, idCollection
            from
            users u join drivers o on u.idUser=o.idDriver
            join collections c using(idDriver)
            join collectedQuantities cq using (idCollection)
            join donors d using(idDonor)
            where 
            fechaRecoleccion is not null and recolectado = 1
            and idCollection = ${req.params.idCollection}`, 
            { 
                type: QueryTypes.SELECT
            }
        )

        for(let x = 0; x < notasQuery.length; x++) {
            if(notasQuery[x].idCategory === 1) {
                notas.pan = notasQuery[x].cantidad
            }
            else if(notasQuery[x].idCategory === 2) {
                notas.abarrote = notasQuery[x].cantidad
            }
            else if(notasQuery[x].idCategory === 3) {
                notas.fruta = notasQuery[x].cantidad
            }
            else if(notasQuery[x].idCategory === 4) {
                notas.noComestible = notasQuery[x].cantidad
            }
        }
        
        if(notas) {
            return res.status(200).json({
                notas
            })
        } else {
            return res.status(404).json({
                message: "La nota no tiene cantidades registradas"
            })
        }

    } catch(err) {
        next(err);
    }
})

// GET asignar rutas de entrega
router.get('/assigndeliveries', async(req, res, next) =>{

    try {

        let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')

        // Raw SQL Query
        let driverData = await DB.query(
            `select
            o.idDriver,u.nombre as operador, u.nombreUsuario,u.apellidoP,u.apellidoM,sum(cantidad) as CantidadRecolectada,categories.nombre as categoria,time(fechaRecoleccion) as hora
            from
            users u join drivers o on u.idUser=o.idDriver
            join collections c using(idDriver)
            join collectedQuantities using(idCollection)
            join categories using(idCategory)
            where date(fechaRecoleccion) = '${fechaDeHoy}' and fechaRecoleccion is not null
            group by idCategory
            `,
            { type: QueryTypes.SELECT })
        
        let idChofer = -1
        let chofer = [ {
            idDriver: '',
            operador: '',
            nombreUsuario: '',
            apellidoP: '',
            apellidoM: '',
            recolecciones: []
        }
        ]
        let aux
        
        for (let i = 0; i < driverData.length; i++) {
            if(idChofer !== driverData[i].idDriver) {
                idChofer = driverData[i].idDriver
                aux = await DB.query(
                    `select
                    o.idDriver,u.nombre as operador, u.nombreUsuario,u.apellidoP,u.apellidoM
                    from
                    users u join drivers o on u.idUser=o.idDriver
                    join collections c using(idDriver)
                    join collectedQuantities using(idCollection)
                    join categories using(idCategory)
                    where date(fechaRecoleccion) = '${fechaDeHoy}' and fechaRecoleccion is not null
                    group by idDriver
                    `, 
                    { type: QueryTypes.SELECT })
                    
                    chofer[0].idDriver = aux[0].idDriver
                    chofer[0].operador = aux[0].operador
                    chofer[0].nombreUsuario = aux[0].nombreUsuario
                    chofer[0].apellidoP = aux[0].apellidoP
                    chofer[0].apellidoM = aux[0].apellidoM
                    
            } else {
                aux = await DB.query(
                    `select
                    sum(cantidad) as cantidadRecolectada,categories.nombre as categoria,time(fechaRecoleccion) as hora
                    from
                    users u join drivers o on u.idUser=o.idDriver
                    join collections c using(idDriver)
                    join collectedQuantities using(idCollection)
                    join categories using(idCategory)
                    where date(fechaRecoleccion) = '${fechaDeHoy}' and fechaRecoleccion is not null
                    group by idCategory
                    `, 
                    { type: QueryTypes.SELECT })
                    console.log(aux)
                    chofer[0].recolecciones = (aux)
            }
        }

        if(driverData.length > 0){
            return res.status(200).json({
                chofer
            })
        } else {
            return res.status(400).json({
                name: "Not found",
                message: "No hay registros coincidentes"
            })
        }

    } catch(err) 
    {
        next(err);
    }
}
)

// GET asignar bodegas
router.get('/assignedwarehouses/:idDriver', async(req, res, next) =>{
    
    const { idDriver } = req.params
    let fechaDeHoy = new Date()

    try {
        let warehouseData = await DB.query(
            `select
            u.nombre,u.apellidoP,w.idWarehouse,u.apellidoM,w.nombre as Bodega,cp,municipio,colonia,calle,numExterior,c.nombre as cosa,cantidad
            from
            users u join drivers o on u.idUser=o.idDriver
            join warehousesAssignations wa using(idDriver)
            join assignedQuantities using(idWarehousesAssignation)
            join categories c using(idCategory)
            join warehouses w on w.idWarehouse=wa.idWarehouse
            where date(fecha)='${(fechaDeHoy.toISOString().slice(0, 19).replace('T', ' ')).slice(0, 10)}' and idDriver=${idDriver}`,
            { type: QueryTypes.SELECT }
        )
        
        let auxBodega = {
            bodega: '',
            calle: '',
            numExterior: '',
            colonia: '',
            municipio: '',
            cp: '',
            fruta: '',
            abarrote: '',
            pan: '',
            noComestible: ''
        }

        let idWarehouseIt = -1
        let data = []
        for (let x = 0; x < warehouseData.length; x++) {
            if (warehouseData[x].idWarehouse !== idWarehouseIt) {
                idWarehouseIt = warehouseData[x].idWarehouse
                auxBodega.calle = warehouseData[x].calle
                auxBodega.numExterior = warehouseData[x].numExterior
                auxBodega.colonia = warehouseData[x].colonia
                auxBodega.municipio = warehouseData[x].municipio
                auxBodega.cp = warehouseData[x].cp
                auxBodega.bodega = warehouseData[x].Bodega

                for (let o = 0; o < warehouseData.length; o++) {
                    if(warehouseData[o].cosa === 'Pan' && idWarehouseIt === warehouseData[o].idWarehouse ) {
                        auxBodega.pan = warehouseData[o].cantidad
                    }
                    else if (warehouseData[o].cosa === 'Abarrote' && idWarehouseIt === warehouseData[o].idWarehouse ) {
                        auxBodega.abarrote = warehouseData[o].cantidad
                    }
                    else if (warehouseData[o].cosa === 'Frutas y verduras' && idWarehouseIt === warehouseData[o].idWarehouse ) {
                        auxBodega.fruta = warehouseData[o].cantidad
                    }
                    else if (warehouseData[o].cosa === 'No comestible'&& idWarehouseIt === warehouseData[o].idWarehouse ) {
                        auxBodega.noComestible = warehouseData[o].cantidad
                    } 
                }
                data.push(auxBodega)
                auxBodega = {}           
            }
        }

        if(warehouseData){
            return res.status(200).json({
                data
            })
        } else {
            return res.status(400).json({
                message: "No hay bodegas asignadas"
            })
        }

    } catch(err) {
        next(err);
    }
})

module.exports = router