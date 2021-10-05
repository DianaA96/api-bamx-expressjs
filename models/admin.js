module.exports=(DB,type) => {
    return DB.define('admin', {
        idAdmin: {
             type: type.INTEGER,
             primaryKey: true,
             foreignKey: true,
             references: {
                 model:'users',
                 key: 'idUser'
             }
        }
    },{
        paranoid:true
     }
    );
}