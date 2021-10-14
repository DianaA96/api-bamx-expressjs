const express = require('express');
const router = express.Router();
const {QueryTypes} = require('sequelize');
const { Route, Donor, Vehicle, Collection } = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database');

//obtiene todas las rutas
router.get('/', async (req, res, next) => { 
    if (req.query.name) {
        DB.query(
            `select
            r.nombre,count(r.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            where r.nombre LIKE "%${req.query.name}%" and r.deletedAt is NULL or d.nombre LIKE "%${req.query.name}%" and d.deletedAt is NULL 
            or d.municipio LIKE "%${req.query.name}%" and d.deletedAt is NULL or d.calle LIKE "%${req.query.name}%" and d.deletedAt is NULL
            or d.colonia LIKE "%${req.query.name}%" and d.deletedAt is NULL
            group by nombre order by r.createdAt desc;`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            return res.status(200).json({
                rutas
            });
        })
        .catch((err) => {
            next(err);
        })
    } else if (req.query.order) {
        DB.query(
            `select
            r.nombre,count(r.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            group by nombre order by r.nombre ${req.query.order};`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            return res.status(200).json({
                rutas
            });
        })
        .catch((err) => {
            next(err);
        })
    } else if (req.query.donors) {
        DB.query(
            `select
            r.nombre,count(r.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            group by nombre order by count(r.idRoute) ${req.query.donors};`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            return res.status(200).json({
                rutas
            });
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
            group by nombre
            having
            puntosRecoleccion=${req.query.numberDonors}`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            return res.status(200).json({
                rutas
            });
        })
        .catch((err) => {
            next(err);
        })
    } else {
        DB.query(
            `select
            r.nombre,count(r.idRoute) as puntosRecoleccion,r.idRoute
            from
            routes r
            left join donors d on r.idRoute=d.idRoute
            group by nombre order by r.createdAt desc;`,
            { 
               nest:true, 
               type: QueryTypes.SELECT
            }
        )
        .then((rutas) => {
            return res.status(200).json({
                rutas
            });
        })
        .catch((err) => {
            next(err);
        })
    }
})

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

        let unidades = await Vehicle.findAll(
            {
                attributes: [["idVehicle", "value"], ["modelo", "label"]],
            }
        )

        if(extraDonors || rutas || unidades) {
            return res.status(200).json(
                 {rutas, extraDonors, unidades})
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
    DB.query(
        `select
        r.idRoute ,r.nombre,d.nombre,calle, numExterior, colonia, cp
        from
        routes r left join donors d on r.idRoute=d.idRoute
        where r.idRoute=:idRoute`,
       { 
           replacements:{idRoute: idRoute},
           nest:true, 
           type: QueryTypes.SELECT
       }
    )
   .then((rutas) => {
       return res.status(200).json({
           rutas
       });
   })
   .catch((err) => {
       next(err);
   })
})

// ENDPOINT MODAL ASIGNAR RUTAS DE RECOLECCIÓN [POST]
router.post('/assignroute/', async (req, res, next) => {
        
        const {idDriver, idRoute, idVehicle, donors} = req.body.body
        
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
            let nuevaFecha = new Date()
            
            // Ciclamos el post de recolecciones de donadores asociados a la ruta especificada
            for(let a = 0; a < tiendasAsociadasRuta.length; a++) { 
                await Collection.create({ 
                    fechaAsignacion: nuevaFecha,
                    idDriver: idDriver,
                    idDonor: tiendasAsociadasRuta[a].dataValues.idDonor,
                    idVehicle: idVehicle
                })
            }
            
            // Ciclamos el post de recolecciones de donadores extraordinarios
            for(let b = 0; b < donors.length; b++) {
                await Collection.create({ 
                    fechaAsignacion: nuevaFecha,
                    idDriver: idDriver,
                    idDonor: donors[b],
                    idVehicle: idVehicle
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
    console.log(req.body)
    const {route}=req.body
    try {
        let nombrer = await Route.findOne({
            where: {nombre: route.nombre}
        })
        if(nombrer){
            return res.status(400).json({
                message: "Ya existe una una ruta con ese nombre",
            })
        }
        let ruta= await Route.create({ 
            nombre: route.nombre
        })
        //pr es lo que le puse en el POSTMAN 
        let ids = route.pr
        ids.map(async (x,i)=>{
            //console.log(chalk.greenBright(route.pr[i]))
            await Donor.findByPk(route.pr[i]).then((y)=>{
                let x =y.idDonor //x es el resultado de buscarlo
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
    console.log(req.body)
    const {idRoute, idDonor}= req.params
    const {route}=req.body

    try {
        let ruta = await Route.findOne({
            where: {nombre: route.nombre}
        })
        if(ruta){
            return res.status(400).json({
                message: "Ya existe una una ruta con ese nombre",
            })
        }
        if(ruta){
            await ruta.update(route)
            //pr es donors
            let ids = route.pr
            ids.map(async (x,i)=>{
            //console.log(chalk.greenBright(route.pr[i]))
            await Donor.findByPk(route.pr[i]).then((y)=>{
                let x =y.idDonor //x es el resultado de buscarlo
            })
            await Donor.update({idRoute: ruta.idRoute}, {where:{idDonor: Donor.idDonor=x}} )
            })
        }
        return res.status(201).json({ruta})
    } catch(err) {
            next(err);
        }
    }
)

//eliminar ruta
router.delete('/:idRoute', async (req, res, next)=>{
    const {idRoute} = req.params;
    DB.query(`select
            nombre
            from
            Routes
            where
            idRoute=:idRoute`,
        {   
            replacements: {idRoute: idRoute},
            type: QueryTypes.SELECT
        }    
        )
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

module.exports = router;