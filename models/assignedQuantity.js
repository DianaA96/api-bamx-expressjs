module.exports=(DB,type) => {
    return DB.define('assignedQuantity', {
        idAssignedQuantity:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            reference:{
                model: 'warehousesAssignations',
                key: 'idWarehousesAssignation'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            reference:{
                model: 'categorys',
                key: 'idCategory'
            }
        },
        cantidad:{
            type: type.INTEGER,
            allowNull: false,
        }
    },{
        paranoid:true
    }
    );
}