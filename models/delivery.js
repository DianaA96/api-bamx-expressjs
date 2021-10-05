module.exports=(DB,type) => {
    return DB.define('delivery', {
        idDelivery:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idReceiver:{
            type: type.INTEGER,
            foreignKey: true,
            references:{
                model:'receiver',
                key: 'idReceiver'
            }
        },
        idAssignedWarehouse:{
            type: type.INTEGER,
            foreignKey: true,
            references:{
                model:'assignedWarehouse',
                key: 'idAssignedWarehouse'
            }
        }
    },{
        paranoid:true
    }
    );
}