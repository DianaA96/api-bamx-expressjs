module.exports=(DB,type) => {
    return DB.define('categories', {
        idCategory:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre:{
            type: type.STRING
        }
    },{
        paranoid:true
     }
    );
}