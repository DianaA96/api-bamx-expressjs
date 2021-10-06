module.exports=(DB,type) => {
    return DB.define('warehouse', {
        idWarehouse:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idReceiver:{
            type: type.INTEGER,
            foreignKey: true,
            reference:{
                model:'receivers',
                key: 'idReceiver'
            }
        },
        nombre:{
            type: type.INTEGER,
            allowNull: false,
        },
        cp:{
            type: type.INTEGER,
            allowNull: false,
        },
        municipio:{
            type: type.STRING,
            allowNull: false,
        },
        colonia:{
            type: type.STRING,
            allowNull: false,
        },
        calle: {
            type: type.STRING,
            allowNull: false,
        },
        numExterior:{
            type: type.INTEGER,
            allowNull: false
        }
    },{
        paranoid:true
    }
    );
}