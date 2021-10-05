// Importamos Express, el Router y los modelos necesarios para las queries
const express = require('express');
const  {QueryTypes} = require('sequelize');
const router = express.Router();
const driver = require('./database');

// Destructuramos los modelos requeridos en las consultas que incluyen raw queries de SQL
const { DB, Refer }  = require('./database')

router.get('/', async (req, res, next) => {
        DB.query(
            `SELECT * FROM Drivers`,
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

module.exports = router
