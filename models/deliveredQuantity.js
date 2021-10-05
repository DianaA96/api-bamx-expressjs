module.exports=(DB,type) => {
    return DB.define('deliveredQuantity', {
        idDelivery:{
            type: type.INTEGER,
            primaryKey: true,
            refences:{
                model: 'deliveries',
                key: 'idDelivery'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            refences:{
                model: 'category',
                key: 'idCategory'
            }
        },
        cantidad:{
            type: type.INTEGER,
            allowNull: false
        }
    },{
        paranoid:true
    }
    );
}