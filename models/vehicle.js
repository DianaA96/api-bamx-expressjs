module.exports=(DB,type) => {
    return DB.define('vehicle', {
        idVehicle: {
             type: type.INTEGER,
             primaryKey: true,
             autoIncrement: true,
        },
        placa:{
            type: type.STRING,
            allowNull: false,
        },
        poliza:{
            type: type.INTEGER,
            allowNull: false,
        },
        vencimientoPoliza:{
            type: type.DATE,
            allowNull: false,
        }
    },{
        paranoid:true
     }
    );
}