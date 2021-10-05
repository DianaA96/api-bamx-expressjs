module.exports=(DB,type) => {
    return DB.define('assignedQuantity', {
        idAssignedWarehouse:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            reference:{
                model: 'assignedWarehouse',
                key: 'idAssignedWarehouse'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            reference:{
                model: 'category',
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