module.exports=(DB,type) => {
    return DB.define('driver', {
        idDriver: {
             type: type.INTEGER,
             //autoIncrement:true,
             primaryKey: true,
             foreignKey: true,
             references: {
                 model:'users',
                 key: 'idUser'
             }
        },
        licencia: {
            type: type.STRING,
            allowNull: true
        },
        vencimientoLicencia: {
            type: type.DATE,
            allowNull: true
        },
    },{
        paranoid:true
     }
    );
}