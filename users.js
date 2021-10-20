// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {QueryTypes} = require('sequelize');
const {Receiver, TrafficCoordinator, Warehouse, Admin} = require('./database');
const {User, Driver} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database')

//obtiene todo los usuarios **CHECAR EL SELECT - ESTE ENDPOINT DEBERÍA IR AL FINAL DEL ARCHIVO PORQUE ES EL ENDPOINT MÁS GENERAL :)
router.get('/', async (req, res, next) => {
    if (req.query.name) {
        DB.query(
            `select
            idUser,nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
            from
            users u left join drivers o on u.idUser=o.idDriver
            left join receivers r on r.idReceiver=u.idUser
            left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator where u.deletedAt is NULL
            and nombre LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoP LIKE "%${req.query.name}%" or u.deletedAt is NULL and apellidoM LIKE "%${req.query.name}%" or u.deletedAt is NULL and idUser LIKE "%${req.query.name}%"`
            ,{nest:true,type: QueryTypes.SELECT}
        ).then((listaUsuarios) => {
            if(listaUsuarios!=''){
                return res.status(200).json({
                    listaUsuarios
                });
            }else{
                return res.status(404).json({
                    name: 'Not Found',
                    message: 'No existen usuarios registrados'
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    } 

    else if (req.query.role || req.query.order) {
        let varConsultaRol = `and ${req.query.role} is not NULL`
        DB.query(
            `select
            idUser,nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
            from
            users u left join drivers o on u.idUser=o.idDriver
            left join receivers r on r.idReceiver=u.idUser
            left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator where u.deletedAt is NULL
            ${req.query.role ? varConsultaRol: ""}
            order by nombre ${req.query.order}`
            ,{nest:true,type: QueryTypes.SELECT}
        ).then((listaUsuarios) => {
            if(listaUsuarios!=''){
                return res.status(200).json({
                    listaUsuarios
                });
            }else{
                return res.status(404).json({
                    name: 'Not Found',
                    message: 'No existen usuarios registrados'
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    }

    else {
        DB.query(
            `select
            idUser,nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
            from
            users u left join drivers o on u.idUser=o.idDriver
            left join receivers r on r.idReceiver=u.idUser
            left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator where u.deletedAt is NULL`
            ,{nest:true,type: QueryTypes.SELECT}
        ).then((listaUsuarios) => {
            if(listaUsuarios!=''){
                return res.status(200).json({
                    listaUsuarios
                });
            }else{
                return res.status(404).json({
                    name: 'Not Found',
                    message: 'No existen usuarios registrados'
                })
            }
        })
        .catch((err) => {
            next(err);
        })
    }
})

//obtiene a los receptores
router.get('/receivers', async (req, res, next) => {
    DB.query(
        `select
        nombreUsuario,nombre,apellidoP,apellidoM,idUser
        from
        users u left join receivers r on r.idReceiver=u.idUser
        where idReceiver is not null and u.deletedAt is NULL`,
        { type: QueryTypes.SELECT})
    .then((listaReceptores) => {
        if(listaReceptores!=''){
            return res.status(200).json({
                listaReceptores
            });
        }else{
            return res.status(404).json({
                name: 'Not Found',
                message: 'No existen receptores registrados'
            })
        }
    })
    .catch((err) => {
        next(err);
    })
})

//obtiene a los coordinadores
router.get('/trafficCoordinators', async (req, res, next) => {
    DB.query(
        `select
        nombreUsuario,nombre,apellidoM,apellidoP,idTrafficCoordinator
        from
        users u left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator
        where idTrafficCoordinator is not null and u.deletedAt is NULL`,
        { type: QueryTypes.SELECT})
    .then((listaCoordinadores) => {
        if(listaCoordinadores!=''){
            return res.status(200).json({
                listaCoordinadores
            });
        }else{
            return res.status(404).json({
                name: 'Not Found',
                message: 'No existen coordinadores registrados'
            })
        }
    })
    .catch((err) => {
        next(err);
    })
})

//obtener los datos de un usuaario especifico
router.get('/:idUser',async (req, res, next) => {
    const { idUser } = req.params;
    DB.query(
        `select
        nombreUsuario,nombre,apellidoM,apellidoP,email,telefono,o.licencia,o.vencimientoLicencia,
        idDriver,idReceiver,idTrafficCoordinator
        from users u left join drivers o on u.idUser=o.idDriver
        left join receivers r on r.idReceiver=u.idUser
        left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator 
        where u.deletedAt is NULL and idUser=:idUser`,
    {
        replacements: {idUser: idUser},
        type: QueryTypes.SELECT
    }).then((datosUsuario) => {
        if(datosUsuario!=''){
            return res.status(200).json({
                datosUsuario
            })
        }else{
            return res.status(404).json({
                name: 'Not Found',
                message: 'El usuario no se encontró'
            })
        }
    })
    .catch (
        (err) => next(err)
    )
})

//endpoint crear ADMINISTRADORES
router.post('/admins/', async (req, res, next) => {
    console.log(req.body)
    const { user, admin } = req.body
    let usuarioAdministrador =  user
    try {
        let usuario = await User.findOne({
            where: {telefono: user.telefono},
            where: {email: user.email},
            where: {nombreUsuario: user.nombreUsuario},
        })
        if(usuario) {
            return res.status(400).json({
                message: "Lo sentimos, este administrador ya existe",
            })
        }

        let contrasenaNueva = await bcrypt.hash(usuarioAdministrador.contrasena, 10)

        usuario = {...usuarioAdministrador, contrasena: contrasenaNueva}

        await User.create(usuario)
        .then((a)=>{
            Admin.create({
                idAdmin: a.idUser,
            })
        })   

        let {idAdmin, contrasena,nombreUsuario, nombre, apellidoP, apellidoM, email, telefono} = usuarioAdministrador
        
        const payload = {
            idUser: usuario.idUser,
        }

        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    data: token,
                });
            }
        )
    } catch(err) {
        next(err);
        }
    }
)

//endpoint crear COORDINADORES
router.post('/trafficCoordinators/', async (req, res, next) => {
    console.log(req.body)
    const { user, trafficCoordinator } = req.body
    let usuarioCoordinador =  user
    try {
        let usuario = await User.findOne({
            where: {telefono: user.telefono},
            where: {email: user.email},
            where: {nombreUsuario: user.nombreUsuario},
        })
        if(usuario) {
            return res.status(400).json({
                message: "Lo sentimos, este coordinador ya existe",
            })
        }

        let contrasenaNueva = await bcrypt.hash(usuarioCoordinador.contrasena, 10)

        usuario = {...usuarioCoordinador, contrasena: contrasenaNueva}

        await User.create(usuario)
        .then((a)=>{
            TrafficCoordinator.create({
                idTrafficCoordinator: a.idUser,
            })
        })   

        let {idTrafficCoordinator, contrasena,nombreUsuario, nombre, apellidoP, apellidoM, email, telefono} = usuarioCoordinador
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    data: token,
                });
            }
        )
    } catch(err) {
        next(err);
        }
    }
)

//endpoint para crear OPERADORES 
router.post('/drivers/', async (req, res, next) => {
    
    const { user } = req.body
    const {driver} = req.body
    let usuarioOperador =  user
    
    try {
        let usuario = await User.findOne({
            where: {telefono: user.telefono},
            where: {email: user.email},
            where: {nombreUsuario: user.nombreUsuario},
        })
        let licen = await Driver.findOne({
            where: {licencia: driver.licencia}
        })

        if(usuario || licen) {
            return res.status(400).json({
                message: "Lo sentimos, la cuenta ya existe",
            })
        }
        console.log(usuarioOperador.contrasena)
        let contrasenaNueva = await bcrypt.hash(usuarioOperador.contrasena, 10)

        usuario = {...usuarioOperador, contrasena: contrasenaNueva}
        console.log(driver)
        let a =await User.create(usuario)
        .then((a)=>{
            console.log(a)
            Driver.create({ 
                idDriver: a.idUser,
                licencia: driver.licencia,
                vencimientoLicencia: driver.vencimientoLicencia
            })
            
        })     
        let {nombreUsuairo, nombre, apellidoP, apellidoM, email, telefono, licencia,vencimientoLicencia, idDriver} = usuarioOperador
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    data: token,
                });
            }
        )
    } catch(err) {
        next(err);
        }
    }
)

//endpoint crear RECEPTORES
router.post('/receivers/', async (req, res, next) => {
    
    console.log(req.body)
    const { user, receiver } = req.body
    let usuarioReceptor =  user
    //UsuarioReceptor.puesto = "Receiver"
    
    try {
        let usuario = await User.findOne({
            where: {telefono: user.telefono},
            where: {email: user.email},
            where: {nombreUsuario: user.nombreUsuario},
        })

        if(usuario) {
            return res.status(400).json({
                message: "Lo sentimos, este receptor ya existe",
            })
        }

        let contrasenaNueva = await bcrypt.hash(usuarioReceptor.contrasena, 10)
        usuario = {...usuarioReceptor, contrasena: contrasenaNueva}
        
        let d = await User.create(usuario)// registro del ultimo usuario
        let c = await Warehouse.findByPk(receiver.idWarehouse)//cuerpo de la bodega dentro del registro
        if(c&&d){
            await Receiver.create({
                idReceiver: d.idUser,
                idWarehouse: receiver.idWarehouse    
            })       
            await c.update({idReceiver: d.idUser})
        }
        let {nombreUsuairo, nombre, apellidoP, apellidoM, email, telefono} = usuarioReceptor
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    data: token,
                });
            }
        )
    } catch(err) {
        next(err);
        }
    }
)

//patch OERADORES 
router.patch('/:idUser/drivers/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, driver } = req.body;
    try{
        let usuarioe = await User.findByPk(idUser)//obtiene los datos del operador seleccionado
        
        //coincidendia de nombreUsuario
        let ocupado = await User.findOne({where:{nombreUsuario:user.nombreUsuario}}) 
        if(ocupado==null){
            ocupado = usuarioe
        }
        //coincidencia de licencia
        let licenciaExiste = await Driver.findOne({where:{licencia:driver.licencia}})
        if(licenciaExiste==null){
            licenciaExiste = usuarioe
        }
        //coincidencia de email
        let correoe = await User.findOne({where:{email:user.email}})
        if(correoe==null){
            correoe = usuarioe
        }
        //coincidencia de telefono
        let tel = await User.findOne({where:{telefono:user.telefono}})
        if(tel==null){
            tel = usuarioe
        }

        if((ocupado.idUser!=usuarioe.idUser)||(licenciaExiste.idUser!=usuarioe.idUser)||(tel.idUser!=usuarioe.idUser)||(correoe.idUser!=usuarioe.idUser)){//verifica si la licencia, nombreUsuario,telefono o email pertenecen a otro usuario 
            return res.status(400).json({
                name: "Bad request",
                message: "Los datos que intentas asignar ya pertenecen a otro usuario u operador"
            })
        }else{
            let operador = await Driver.findByPk(idUser)
            let usuario = await User.findByPk(idUser)
    
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
        }
        } catch(err) {
            next(err);
        }
    }
)

//patch COORDINADORES 
router.patch('/:idUser/trafficCoordinators/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, trafficCoordinator } = req.body;

    try{

        let usuarioe = await User.findByPk(idUser)//obtiene los datos del operador seleccionado
        
        //coincidendia de nombreUsuario
        let ocupado = await User.findOne({where:{nombreUsuario:user.nombreUsuario}}) 
        if(ocupado==null){
            ocupado = usuarioe
        }
        //coincidencia de email
        let correoe = await User.findOne({where:{email:user.email}})
        if(correoe==null){
            correoe = usuarioe
        }
        //coincidencia de telefono
        let tel = await User.findOne({where:{telefono:user.telefono}})
        if(tel==null){
            tel = usuarioe
        }

        if((ocupado.idUser!=usuarioe.idUser)||(tel.idUser!=usuarioe.idUser)||(correoe.idUser!=usuarioe.idUser)){//verifica si la licencia, nombreUsuario,telefono o email pertenecen a otro usuario 
            return res.status(400).json({
                name: "Bad request",
                message: "Los datos que intentas asignar ya pertenecen a otro usuario"
            })
        }else{
            let usuario = await User.findByPk(idUser)
        let coordinador = await TrafficCoordinator.findByPk(idUser)
    
        if(usuario && coordinador) {
            await usuario.update(user)
            await coordinador.update(trafficCoordinator)
            
            let {
                idUser,
                nombre,
                apellidoP,
                apellidoM,
                nombreUsuario,
                telefono,
                email
            } = usuario

            let {}= coordinador

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
                coordinadorActualizado:{
                  
                }
            })
        } else {
            return res.status(404).json({
                name: "Not Found",
                message: "El coordinador que intentas actualizar no existe"
                })
            }
        }
        } catch(err) {
            next(err);
        }
    }
)

//patch Receptor 
router.patch('/:idUser/receivers/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, warehouses } = req.body;
     
    try{

        let usuarioe = await User.findByPk(idUser)//obtiene los datos del operador seleccionado
        
        //coincidendia de nombreUsuario
        let ocupado = await User.findOne({where:{nombreUsuario:user.nombreUsuario}}) 
        if(ocupado==null){
            ocupado = usuarioe
        }
        //coincidencia de email
        let correoe = await User.findOne({where:{email:user.email}})
        if(correoe==null){
            correoe = usuarioe
        }
        //coincidencia de telefono
        let tel = await User.findOne({where:{telefono:user.telefono}})
        if(tel==null){
            tel = usuarioe
        }

        if((ocupado.idUser!=usuarioe.idUser)||(tel.idUser!=usuarioe.idUser)||(correoe.idUser!=usuarioe.idUser)){//verifica si la licencia, nombreUsuario,telefono o email pertenecen a otro usuario 
            return res.status(400).json({
                name: "Bad request",
                message: "Los datos que intentas asignar ya pertenecen a otro usuario"
            })
        }else{
            let usuario = await User.findByPk(idUser)
            let receptor = await Receiver.findByPk(idUser)
            let bodega = await Warehouse.findByPk(warehouses.idWarehouse)
           

            if(usuario && receptor && bodega) {
                await usuario.update(user)
                
                let {
                    idUser,
                    nombre,
                    apellidoP,
                    apellidoM,
                    nombreUsuario,
                    telefono,
                    email
                } = usuario
                DB.query(
                `
                UPDATE warehouses 
                SET idReceiver= ${idUser}
                WHERE idWarehouse=${bodega.idWarehouse}`,
                {
                    type: QueryTypes.UPDATE
                }).then((receptoract) => {
                    if(receptoract!=''){
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
                            receptoract
                        })
                    }else{
                        return res.status(404).json({
                            name: 'Not Found',
                            message: 'No se fue posible actualizar la bodega asignada'
                        })
                    }
                }).catch((err) => {
                    next(err);
                })
            } else {
                return res.status(404).json({
                    name: "Not Found",
                    message: "El receptor que intentas actualizar o la bodega que intentas asignar no existe"
                    })
                }
        }
        } catch(err) {
            next(err);
        }
    }
)


router.post('/login', async (req, res, next)=> {
    const { body } = req.body;
    let roles={}
    let rol = "";
    console.log(body)

    try{
        const user = await User.findOne({
            where: {
                nombreUsuario: body.nombreUsuario,
            }
        })

        if (!user) {
            return res.status(401).json({
                data: 'Credenciales inválidas',
            })
        }

        const isMatch = await bcrypt.compare(
            body.contrasena,
            user.contrasena
        )


        if (!isMatch) {
            return res.status(401).json({
                data:  'Credenciales inválidas'
            })
        }

        
        let listaRoles = await DB.query(
            `select
            idAdmin,idDriver,idReceiver,idTrafficCoordinator
            from users u
            left join admins a on a.idAdmin=u.idUser
            left join drivers d on d.idDriver=u.idUser
            left join receivers r on r.idReceiver=u.idUser
            left join trafficCoordinators t on t.idTrafficCoordinator=u.idUser
            where nombreUsuario='${body.nombreUsuario}'`
            ,{nest:true,type: QueryTypes.SELECT}
        )
        
            
        if(listaRoles[0].idDriver!=null){
            rol='operador'
        }
        if(listaRoles[0].idReceiver!=null){
            rol='receptor'
        }
        if(listaRoles[0].idTrafficCoordinator!=null){
            rol='trafico'
        }
        if(listaRoles[0].idAdmin!=null){
            rol='admin'
        }

        const idUser = user.idUser

        const payload = {
            idUser: user.idUser
        }

        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    data: token,rol,idUser
                });
            }
        )
    }
    catch (error) {
        next(error)
    }
        
})

//eliminar Usuarios
router.delete('/:idUser', async (req, res, next)=>{
        const {idUser} = req.params;
        try{
            let usuario = await User.findByPk(idUser)
            if(usuario){
                await usuario.destroy(/*{force: true}*/)
                return res.status(200).json({
                    usuarioEliminado: usuario
                })
            }else{
                return res.status(404).json({
                    name: "Not found",
                    message: "El empleado seleccionado no existe"
                })
            }

        }catch(err){
            next(err);
        }
    }
)

module.exports = router
