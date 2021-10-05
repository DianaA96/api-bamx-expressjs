module.exports=(DB,type) => {
    return DB.define('assignedWarehouse', {
        idAssignedWarehouse:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idDriver:{
            type: type.INTEGER,
            foreignKey: true,
            reference:{
                model: 'driver',
                key: 'idDriver'
            }
        },
        idWarehouse:{
            type: type.INTEGER,
            foreignKey: true,
            reference:{
                model: 'warehouse',
                key: 'idWarehouse'
            }
        },
        fecha:{
            type: type.DATE,
            allowNull: false
        }        
    },{
        paranoid:true
    }
    );
}