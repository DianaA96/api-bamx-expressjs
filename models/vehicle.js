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
            unique:true
        },
        poliza:{
            type: type.INTEGER,
            allowNull: false,
            unique:true
        },
        vencimientoPoliza:{
            type: type.DATE,
            allowNull: false,
        },
        modelo:{
            type: type.STRING,
            allowNull: false,
        }
    },{
        paranoid:true
     }
    );
}