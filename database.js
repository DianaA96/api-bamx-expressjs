require('dotenv').config();
const {Sequelize} = require('sequelize');
const DonorModel = require('./models/donor');

const DB = new Sequelize(
    'PRUEBA',
    'admin',
    'rootroot',
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

//models
const Donor = DonorModel(DB, Sequelize);

DB.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
})
.catch ( err  => {
    console.error('Unable to connect to the database: ', err);
});


// DB.sync({ force: true }) para hacer drop de las tablas antes del sync
DB.sync().then(() => {
    console.log(`Database & tables created!`)
}).catch(err => console.error(err))


module.exports={
    Donor,
}