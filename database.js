require('dotenv').config();
const {Sequelize} = require('sequelize');

//modelos del archivo tablas
const adminModel = require('./tablas/admin');
const assignedQuantityModel = require('./tablas/assignedQuantity');
const warehousesAssignation = require('./tablas/warehousesAssignation');
const categoryModel = require('./tablas/category');
const collectedQuantityModel = require('./tablas/collectedQuantity');
const collectionModel = require('./tablas/collection');
const coordinatorModel = require('./tablas/coordinator');
const deliveredQuantityModel = require('./tablas/deliveredQuantity');
const deliveryModel = require('./tablas/delivery');
const donorModel = require('./tablas/donor');
const driverModel = require('./tablas/driver');
const receiverModel = require('./tablas/receiver');
const routeModel = require('./tablas/route');
const userModel = require('./tablas/user');
const vehicleModel = require('./tablas/vehicle');
const warehouseModel = require('./tablas/warehouse')

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

//models
const admin = adminModel(DB,Sequelize);
const assignedQuantity = assignedQuantityModel(DB,Sequelize);
const warehousesAssignation = warehousesAssignationModel(DB,Sequelize);
const category = categoryModel(DB,Sequelize);
const collectedQuantity = collectedQuantityModel (DB,Sequelize);
const collection = collectionModel(DB,Sequelize);
const coordinator = coordinatorModel(DB,Sequelize);
const deliveredQuantity = deliveredQuantityModel(DB,Sequelize);
const delivery = deliveryModel(DB,Sequelize);
const donor = donorModel(DB,Sequelize);
const driver = driverModel(DB,Sequelize);
const receiver = receiverModel(DB,Sequelize);
const route = routeModel(DB,Sequelize);
const user = userModel(DB,Sequelize);
const vehicle = vehicleModel(DB,Sequelize);
const warehouse = warehouseModel(DB,Sequelize);


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
    admin,
    assignedQuantity,
    warehousesAssignation,
    category,
    collectedQuantity,
    collection,
    coordinator,
    deliveredQuantity,
    delivery,
    donor,
    driver,
    receiver,
    route,
    user,
    vehicle,
    warehouse,
    DB
}