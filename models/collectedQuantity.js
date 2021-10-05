module.exports=(DB,type) => {
    return DB.define('collectedQuantity', {
        idCollection:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            references:{
                model: 'collection',
                key: 'idCollection'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            references:{
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