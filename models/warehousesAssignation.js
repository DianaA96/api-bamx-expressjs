module.exports=(DB,type) => {
    return DB.define('warehousesAssignation', {
        idWarehousesAssignation:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idDriver:{
            type: type.INTEGER,
            foreignKey: true,
            reference:{
                model: 'drivers',
                key: 'idDriver'
            }
        },
        idWarehouse:{
            type: type.INTEGER,
            foreignKey: true,
            reference:{
                model: 'warehouses',
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