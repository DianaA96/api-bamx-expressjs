module.exports=(DB,type) => {
    return DB.define('route', {
        idRoute: {
             type: type.INTEGER,
             primaryKey: true,
             autoIncrement: true
        },
        nombre:{
            type: type.STRING,
            allowNull: false
        }
    },{
        paranoid:true
     }
    );
}