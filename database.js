require('dotenv').config();
const {Sequelize} = require('sequelize');
const chalk = require('chalk');

//modelos del archivo models
const adminModel = require('./models/admin');
const assignedQuantityModel = require('./models/assignedQuantity');
const warehousesAssignationModel = require('./models/warehousesAssignation');
const collectedQuantityModel = require('./models/collectedQuantity');
const categorieModel = require('./models/categorie');
const collectionModel = require('./models/collection');
const trafficCoordinatorModel = require('./models/trafficCoordinator');
const deliveredQuantityModel = require('./models/deliveredQuantity');
const deliveryModel = require('./models/delivery');
const donorModel = require('./models/donor');
const driverModel = require('./models/driver');
const receiverModel = require('./models/receiver');
const routeModel = require('./models/route');
const userModel = require('./models/user');
const vehicleModel = require('./models/vehicle');
const warehouseModel = require('./models/warehouse')

//Instanciamos la base de datos
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

// Models
const Admin = adminModel(DB,Sequelize);
const AssignedQuantity = assignedQuantityModel(DB,Sequelize);
const WarehousesAssignation = warehousesAssignationModel(DB,Sequelize);
const CollectedQuantity = collectedQuantityModel (DB,Sequelize);
const Categorie = categorieModel(DB,Sequelize);
const Collection = collectionModel(DB,Sequelize);
const TrafficCoordinator = trafficCoordinatorModel(DB,Sequelize);
const DeliveredQuantity = deliveredQuantityModel(DB,Sequelize);
const Delivery = deliveryModel(DB,Sequelize);
const Donor = donorModel(DB,Sequelize);
const Driver = driverModel(DB,Sequelize);
const Receiver = receiverModel(DB,Sequelize);
const Route = routeModel(DB,Sequelize);
const User = userModel(DB,Sequelize);
const Vehicle = vehicleModel(DB,Sequelize);
const Warehouse = warehouseModel(DB,Sequelize);

// Se accede a la instancia de la base de datos
DB.authenticate()
.then( () => {
    console.log(chalk.cyanBright('Connection has been established successfully.'));
})
.catch ( err  => {
    console.error(chalk.redBright('Unable to connect to the database: ', err));
});


// DB.sync({ force: true }) para hacer drop de las models antes del sync
DB.sync().then(() => {
    console.log(chalk.cyanBright(`Database & tables created!`))
}).catch(err => console.error(chalk.redBright(err)))


// Se exportan los módulos
module.exports={
    Admin,
    AssignedQuantity,
    WarehousesAssignation,
    CollectedQuantity,
    Categorie,
    Collection,
    TrafficCoordinator,
    DeliveredQuantity,
    Delivery,
    Donor,
    Driver,
    Receiver,
    Route,
    User,
    Vehicle,
    Warehouse,
    DB
}