module.exports=(DB,type) => {
    return DB.define('category', {
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