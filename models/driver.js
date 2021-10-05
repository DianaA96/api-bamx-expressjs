module.exports=(DB,type) => {
    return DB.define('driver', {
        idDriver: {
             type: type.INTEGER,
             primaryKey: true,
             foreignKey: true,
             references: {
                 model:'user',
                 key: 'idUser'
             }
        },
        licencia: {
            type: type.STRING,
            vencimientoLicencia: type.DATE,
        }
    },{
        paranoid:true
     }
    );
}