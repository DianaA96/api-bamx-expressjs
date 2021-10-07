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

module.exports = router
