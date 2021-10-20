const express = require('express');
const router = express.Router();
const {QueryTypes} = require('sequelize');
var moment = require('moment-timezone');
const { Route, Donor, Vehicle, Collection,Driver, Warehouse} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database');

// ENDPOINT MODAL ASIGNAR RUTA DE RECOLECCIÓN: DEVUELVE LA INFORMACIÓN QUE SE MAPEARÁ EN LOS SELECTS
router.get('/extradonors/vehicles', async (req, res, next) => {
    
    try {
       let rutas = await Route.findAll(
            {
                attributes: [["idRoute", "value"], ["nombre", "label"]],
                group: 'nombre'
            }
        )

        let extraDonors = await Donor.findAll(
            {
                attributes: [["idDonor", "value"], ["nombre", "label"]],
                where: {
                    tipo: "Extraordinario"
            }}
        )

        let ordinaryDonors = await Donor.findAll(
            {
                attributes: [["idDonor", "value"], ["nombre", "label"]],
                where: {
                    tipo: "Recurrente"
            }}
        )

        let unidades = await Vehicle.findAll(
            {
                attributes: [["idVehicle", "value"], ["modelo", "label"]],
            }
        )

        if(extraDonors || rutas || unidades) {
            return res.status(200).json(
                 {rutas, extraDonors, ordinaryDonors, unidades})
        } else {
            return res.status(404).json({
                name: "Not Found",
                message: "Fallo en la búsqueda de rutas"
            })
        } 
    } catch (err) {
        next(err)
        }
})


//obtener ruta especifica
router.get('/:idRoute', async (req, res, next) => {
    const {idRoute} = req.params

    try {
        let ruta = {
            idRuta: '',
            nombreRuta: '',
            puntosRecoleccion : []
        }

        let rutaQuery = await DB.query(
                        `select
                        r.idRoute ,r.nombre as nombreRuta
                        from
                        routes r left join donors d on r.idRoute=d.idRoute
                        where r.idRoute=:idRoute`,
                    { 
                        replacements:{idRoute: idRoute},
                        nest:true, 
                        type: QueryTypes.SELECT
                    }
                )
        
        let puntosDeRecoleccion = await DB.query(
                        `select
                        d.idDonor, d.nombre,calle, numExterior, colonia, cp
                        from
                        routes r left join donors d on r.idRoute=d.idRoute
                        where r.idRoute=:idRoute`,
                    { 
                        replacements:{idRoute: idRoute},
                        nest:true, 
                        type: QueryTypes.SELECT
                    }
                )
        
        ruta.idRuta = rutaQuery[0].idRuta
        ruta.nombreRuta = rutaQuery[0].nombreRuta
        ruta.puntosRecoleccion = puntosDeRecoleccion

        return res.status(200).json({
           ruta
       });
    } catch(err) {
        next(err);
    }
})

//asignarentregaoperador
router.get('/assignedWarehouses/:idDriver', async (req, res, next) => {
    const {idDriver} = req.params
    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')
    try {
        let operador = await Driver.findByPk(idDriver)
        if(operador){
            DB.query(
                `
                select
                distinct o.idDriver,u.nombre as operador,u.apellidoP,u.apellidoM,cantidad as CantidadaRecolectada,categories.nombre as categoria,modelo,u.nombreUsuario
                from
                users u join drivers o on u.idUser=o.idDriver
                join collections c on c.idDriver=o.idDriver
                join vehicles using(idVehicle)
                join collectedQuantities using(idCollection)
                join categories using(idCategory)
                where date(fechaAsignacion)='${fechaDeHoy}' and
                c.idDriver=${idDriver}`,
                { type: QueryTypes.SELECT}
            ).then((datosUsuario) => {
                if(datosUsuario!=''){
                    return res.status(200).json({
                        datosUsuario
                    })
                }else{
                    return res.status(404).json({
                        name: 'Not Found',
                        message: 'El operador aun no ha realizado ninguna recoleccion'
                    })
                }
            })
        }else{
            return res.status(400).json({
                name: "Bad Request",
                message: "El operador no existe"
            })
        }
    } catch(err) {
        next(err);
    }
})

// ENDPOINT MODAL ASIGNAR RUTAS DE RECOLECCIÓN [POST]
router.post('/assignroute/', async (req, res, next) => {
        
        const {idDriver, idRoute, idVehicle, donors, fechaFrontend} = req.body.body
        
        try {
            //Búsqueda de las tiendas asociadas a una ruta
            let tiendasAsociadasRuta = await Donor.findAll(
                {
                    attributes: ["idDonor"],
                    where: {
                        idRoute: idRoute
                    }
                }
            )
            
            // Creamos fecha en el backend
            let nuevaFecha = fechaFrontend
            
            // Ciclamos el post de recolecciones de donadores asociados a la ruta especificada
            for(let a = 0; a < tiendasAsociadasRuta.length; a++) { 
                await Collection.create({ 
                    fechaAsignacion: nuevaFecha,
                    idDriver: idDriver,
                    idDonor: tiendasAsociadasRuta[a].dataValues.idDonor,
                    idVehicle: idVehicle,
                    recolectado: 0
                })
            }
            
            // Ciclamos el post de recolecciones de donadores extraordinarios
            for(let b = 0; b < donors.length; b++) {
                await Collection.create({ 
                    fechaAsignacion: nuevaFecha,
                    idDriver: idDriver,
                    idDonor: donors[b],
                    idVehicle: idVehicle,
                    recolectado: 0
                })
            }

            return res.status(201).json(req.body)
            
        } catch(err) {
            next(err);
        }
    }
)

//Crear una ruta
router.post('/donors/', async (req, res, next) => {
   
    const {route}=req.body
    try {

        let nombreRuta = await Route.findOne({
            where: {nombre: route.nombre}
        })
        if(nombreRuta){
            return res.status(400).json({
                message: "Ya existe una una ruta con ese nombre",
            })
        }   
        let ruta= await Route.create({ 
            nombre: route.nombre
        })

        let ids = route.pr
        
        ids.map(async (x,i)=>{
            await Donor.findByPk(route.pr[i]).then((y)=>{
                let x =y.idDonor 
            })
            await Donor.update({idRoute: ruta.idRoute}, {where:{idDonor: Donor.idDonor=x}} )
        })
        return res.status(201).json({ruta})

    } catch(err) {
            next(err);
        }
    }
)

//Actualiza una ruta
router.patch('/:idRoute/donors/', async (req, res, next) => {
    const idRuta =(req.params.idRoute)
    const {route}=req.body
    
    try {

        let rutae = await Route.findByPk(idRuta)

        if(rutae){
            let ocupado = await Route.findOne({where:{nombre:route.nombre}}) 

            if(ocupado===null){
                ocupado = rutae
            }

            if(ocupado.idRoute!==rutae.idRoute){
                return res.status(400).json({
                    message: "Ya existe una una ruta con ese nombre",
                })
            }else{
                
                let ruta= await rutae.update({nombre:route.nombre})

                DB.query(
                    `
                    update donors 
                    set idRoute=null
                    where idRoute = ${idRuta}`,
                    {type:QueryTypes.UPDATE}
                )

                let ids = route.pr //pr es Puntos de recoleccion
                
                ids.map(async (x,i)=>{
                        await Donor.findByPk(route.pr[i]).then((donador)=>{
                            donador.update({idRoute:idRuta})}
                        )
                    }
                )
                return res.status(201).json({ruta})
            }
        }else{
            return res.status(404).json(
                {message: "La ruta que intentas editar no existe."}
            )
        }
        }catch(err) {
            next(err);
        }
    }
)

//Asignar entrega operador
router.post('/deliveries/assignedWarehouses/:idDriver', async (req, res, next) => {
    const {idDriver} = (req.params)
    const {entrega} = (req.body)
    let fechaDeHoy = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD')

    try{
        
        let cA = moment.tz(moment(), 'America/Mexico_city').format('YYYY-MM-DD HH:mm:ss')

        DB.query(
                `
                INSERT 
                INTO warehousesAssignations (fecha, idDriver, idWarehouse, createdAt)
                VALUES ('${fechaDeHoy}', ${idDriver}, ${entrega.idWarehouse},'${cA}')`,
                { type: QueryTypes.INSERT }
            )
            .then((asignacion) => {
                DB.query(
                    `
                    INSERT 
                    INTO assignedQuantities (idWarehousesAssignation, idCategory , cantidad , createdAt) 
                    VALUES (${asignacion[0]},${entrega.c1.idCategoria},${entrega.c1.cantidad},'${cA}')`,
                    { type: QueryTypes.INSERT}
                )
                DB.query(
                    `
                    INSERT 
                    INTO assignedQuantities (idWarehousesAssignation, idCategory , cantidad , createdAt)  
                    VALUES (${asignacion[0]},${entrega.c2.idCategoria},${entrega.c2.cantidad},'${cA}')`,
                    { type: QueryTypes.INSERT}     
                )
                DB.query(
                    `
                    INSERT 
                    INTO assignedQuantities (idWarehousesAssignation, idCategory , cantidad , createdAt)  
                    VALUES (${asignacion[0]},${entrega.c3.idCategoria},${entrega.c3.cantidad},'${cA}')`,
                    { type: QueryTypes.INSERT}     
                )
                DB.query(
                    `
                    INSERT 
                    INTO assignedQuantities (idWarehousesAssignation, idCategory , cantidad , createdAt)  
                    VALUES (${asignacion[0]},${entrega.c4.idCategoria},${entrega.c4.cantidad},'${cA}')`,
                    { type: QueryTypes.INSERT}     
                )
            })
            .catch((err) =>{
                next(err)
            })        
        return res.status(201).json({
            entrega
        })
    }
    catch(err){
        next(err)
    }
})

//eliminar ruta
router.delete('/:idRoute', async (req, res, next)=>{
    const {idRoute} = req.params;
    try{
        let ruta = await Route.findByPk(idRoute)
        if(ruta){
            await ruta.destroy(/*{force: true}*/)
            return res.status(200).json({
                rutaEliminada: ruta
            })
        }else{
            return res.status(404).json({
                name: "Not found",
                message: "La ruta seleccionada no existe"
            })
        }
    }   catch(err){
            next(err);
        }
    }
)


//obtiene todas las rutas
router.get('/', async (req, res, next) => { 
    if (req.query.name) {
        DB.query(
            `select
            r.nombre,count(d.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            where r.nombre LIKE "%${req.query.name}%" and r.deletedAt is NULL or d.nombre LIKE "%${req.query.name}%" and d.deletedAt is NULL and r.deletedAt is NULL
            or d.municipio LIKE "%${req.query.name}%" and d.deletedAt is NULL and r.deletedAt is NULL or d.calle LIKE "%${req.query.name}%" and d.deletedAt is NULL and r.deletedAt is NULL
            or d.colonia LIKE "%${req.query.name}%" and d.deletedAt is NULL and r.deletedAt is NULL
            group by nombre order by r.createdAt desc;`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            if(rutas!=''){
                return res.status(200).json({
                    rutas
                })
            }else{
                return res.status(400).json({
                    message: "No hay registros coincidentes"
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    } else if (req.query.order) {
        DB.query(
            `select
            r.nombre,count(d.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            where r.deletedAt is NULL
            group by nombre order by r.nombre ${req.query.order};`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            if(rutas=!'') {
                return res.status(200).json({
                    rutas
                });
            } else {
                return res.status(404).json({
                    message: 'No se encontraron rutas'
                });
            }
        })
        .catch((err) => {
            next(err);
        })
    } else if (req.query.donors) {
        DB.query(
            `select
            r.nombre,count(d.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            where r.deletedAt is NULL
            group by nombre order by count(r.idRoute) ${req.query.donors};`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            if(rutas!='') {
                return res.status(200).json({
                    rutas
                });
            } else {
                return res.status(404).json({
                    message: 'No se encontraron rutas'
                });
            }
        })
        .catch((err) => {
            next(err);
        })
    } else if (req.query.numberDonors) {
        DB.query(
            `select
            r.nombre,count(d.idRoute) as puntosRecoleccion
            from
            routes r
            join donors d using(idRoute)
            where r.deletedAt is NULL
            group by nombre
            having
            puntosRecoleccion=${req.query.numberDonors}`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            if(rutas=!'') {
                return res.status(200).json({
                    rutas
                });
            } else {
                return res.status(404).json({
                    message: 'No se encontraron rutas'
                });
            }
        })
        .catch((err) => {
            next(err);
        })
    } else {
        DB.query(
            `select
            r.nombre,count(d.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            where r.deletedAt is NULL
            group by nombre order by r.createdAt desc;`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            if(rutas!='') {
                return res.status(200).json({
                    rutas
                });
            } else {
                return res.status(404).json({
                    message: 'No se encontraron rutas'
                });
            }
        })
        .catch((err) => {
            next(err);
        })
    }
})

module.exports = router;