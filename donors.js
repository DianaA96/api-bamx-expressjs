const express = require('express');
const router = express.Router()
const {Sequelize} = require('sequelize');
const {Donor} = require('./database');

router.get('/',(req, res, next)=>{
    Donor.findAll({
        attributes:['IdDonante','Nombre', 'numTelefono', 'Ubicacion']
    })
        .then((allDonors)=>{
            return res.status(200).json({
            data: allDonors
        });
    })
    .catch((err)=>next(err))
})

module.exports = router