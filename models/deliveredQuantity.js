module.exports=(DB,type) => {
    return DB.define('deliveredQuantity', {
        idDelivery:{
            type: type.INTEGER,
            primaryKey: true,
            refences:{
                model: 'deliverys',
                key: 'idDelivery'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            refences:{
                model: 'categorys',
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