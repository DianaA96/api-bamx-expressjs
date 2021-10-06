module.exports=(DB,type) => {
    return DB.define('collectedQuantity', {
        idCollection:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            references:{
                model: 'collections',
                key: 'idCollection'
            }
        },
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            foreignKey: true,
            references:{
                model: 'categories',
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