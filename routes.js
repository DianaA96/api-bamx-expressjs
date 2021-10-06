const express = require('express');
const router = express.Router();
const {QueryTypes} = require('sequelize');
const {Route,Donor} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database')

//obtiene todo los usuarios
router.get('/', async (req, res, next) => {
     DB.query(
        `select
        r.idRoute,r.nombre,count(r.idRoute) as puntosRecoleccion
        from
        routes r
        left join donors d on r.idRoute=d.idRoute
        group by nombre order by r.nombre asc;`,
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
})

//obtener ruta especifica
router.get('/:idRoute', async (req, res, next) => {
    const {idRoute} = req.params
    DB.query(
        `select
        r.nombre,d.nombre,calle, numExterior, colonia, cp
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

router.post('/donors/', async (req, res, next) => {
    console.log(req.body)
    const { route, donors} =req.body
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
            nombre: route.nombre,
            })
        let Routee = await Route.findOne({
            where: {nombre: route.nombre}
        })
        let prueba = donors
        let a
        let idRoutea = Routee.idRoute
        console.log(prueba);
        a.map((donor,i)=>{
            let donador= Donor.findByPk(donor.idDonor)
            donador.update({idRoute: idRoutea})
        })
        return res.status(201).json({ruta})

    } catch(err) 
    {
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
    }catch(err){
        next(err);
    }
}
)

module.exports = router;