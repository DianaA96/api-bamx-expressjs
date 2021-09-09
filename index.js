const express = require('express');
require('dotenv').config();
const Sequelize = require('sequelize');
const app = express();
const port = 5000;

const DB = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_PASS,

    {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: 3306,
        dialectOptions: {
            ssl: 'Amazon RDS',
            connectTimeout: 120000
        }
    }
);

DB.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
})
.catch ( err  => {
    console.error('Unable to connect to the database: ', err);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});