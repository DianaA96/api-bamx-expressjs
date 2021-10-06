// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {QueryTypes} = require('sequelize');
const {Receiver, TrafficCoordinator } = require('./database');
const {User, Driver} = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB }  = require('./database')

//obtiene todo los usuarios **CHECAR EL SELECT
router.get('/', async (req, res, next) => {
    DB.query(
        `select
        nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
        from
        users u left join drivers o on u.idUser=o.idDriver
        left join receivers r on r.idReceiver=u.idUser
        left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator;`
        ,{nest:true,type: QueryTypes.SELECT}
    ).then((listaUsuarios) => {
        return res.status(200).json({
            listaUsuarios
        });
    })
    .catch((err) => {
        next(err);
    })
}
)

//obtiene a los receptores
router.get('/receivers', async (req, res, next) => {
    DB.query(
        `SELECT * FROM receivers`,
        { type: QueryTypes.SELECT})
    .then((listaReceptores) => {
        return res.status(200).json({
            listaReceptores
        });
    })
    .catch((err) => {
        next(err);
    })
}
)

//obtiene a los coordinadores
router.get('/trafficCoordinators', async (req, res, next) => {
    DB.query(
        `SELECT * FROM trafficCoordinators`,
        { type: QueryTypes.SELECT})
    .then((listaCoordinadores) => {
        return res.status(200).json({
            listaCoordinadores
        });
    })
    .catch((err) => {
        next(err);
    })
}
)

//obtener los datos de un usuaario especifico *falta agregar el puesto
router.get('/:idUser',async (req, res, next) => {
    const { idUser } = req.params;
    User.findByPk(idUser)
    .then ((usuario) => {
            if(usuario) {
                const { idUser, nombre, apellidoP, apellidoM, email, telefono } = usuario;
                const datosUsuario = { idUser, nombre, apellidoP, apellidoM, email, telefono }
                return res.status(200).json({datosUsuario})
            } else {
                return res.status(404).json({
                    name: "Not Found",
                    message: "El usuario que buscas no existe :("
                })
            }
        }) 
    .catch (
        (err) => next(err)
    )
})

//endpoint crear COORDINADORES
router.post('/trafficCoordinators/', async (req, res, next) => {
    
    console.log(req.body)
    const { user, trafficCoordinator } = req.body
    let usuarioCoordinador =  user
    //UsuarioReceptor.puesto = "Receiver"
    
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
        await TrafficCoordinator.create({ 
            idTrafficCoordinator: user.idUser,
            })
        let {idTrafficCoordinator, contrasena,nombreUsuairo, nombre, apellidoP, apellidoM, email, telefono} = usuarioCoordinador
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    trafficCoordinator,
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
    
    console.log(req.body)
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

        let contrasenaNueva = await bcrypt.hash(usuarioOperador.contrasena, 10)

        usuario = {...usuarioOperador, contrasena: contrasenaNueva}

        await User.create(usuario)
        await Driver.create({ 
            idDriver: user.idUser,
            licencia: driver.licencia
            })
        let {idUser,nombreUsuairo, nombre, apellidoP, apellidoM, email, telefono, licencia,vencimientoLic} = usuarioOperador
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    driver,
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

        await User.create(usuario)
        await Receiver.create({ 
            idReceiver: user.idUser,
            })
        let {idReceiver,nombreUsuairo, nombre, apellidoP, apellidoM, email, telefono} = usuarioReceptor
        const payload = {
            idUser: usuario.idUser,
        }
        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                return res.status(201).json({
                    receiver,
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

//patch OERADORES 
router.patch('/:idUser/trafficCoordinators/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, trafficCoordinator } = req.body;

    try{
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
                message: "El operador que intentas actualizar no existe"
                })
            }
        } catch(err) {
            next(err);
        }
    }
)

//patch Receptor 
router.patch('/:idUser/receivers/', async (req, res, next) => {

    const { idUser } = req.params;
    const { user, receiver } = req.body;

    try{
        let usuario = await User.findByPk(idUser)
        let receptor = await Receiver.findByPk(idUser)
    
        if(usuario && receptor) {
            await usuario.update(user)
            await receptor.update(receiver)
            
            let {
                idUser,
                nombre,
                apellidoP,
                apellidoM,
                nombreUsuario,
                telefono,
                email
            } = usuario

            let {}= receptor

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
                receptor:{
                  
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

//Endpoint para validar las credenciales con bcrypt
/*
router.post('/login', async (req, res, next)=> {
    const { body } = req.body;

    try {
        const user = await User.findOne({
            where: {
                email: body.email,
            }
        })

        if (!user) {
            return res.status(401).json({
                data: 'Credenciales no válidas',
            })
        }

        const isMatch = await bcrypt.compare(
            body.contrasena,
            user.contrasena,
        )

        if (!isMatch) {
            return res.status(401).json({
                data: 'Credenciales no válidas',
            })
        }

        const payload = {
            idUser: user.idUser,
        }

        jwt.sign(
            payload,
            process.env.AUTH_SECRET,
            { expiresIn: 10800 },
            (err, token) => {
                console.log(token)
                return res.status(201).json({
                    data: token,
                });
            }
        )

    } catch (error) {
    
    }
})
*/

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