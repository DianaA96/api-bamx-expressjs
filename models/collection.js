module.exports=(DB,type) => {
    return DB.define('collections', {
        idCollection:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idDriver: {
             type: type.INTEGER,
             foreignKey: true,
             references: {
                 model:'drivers',
                 key: 'idDriver'
             }
        },
        idDonor: {
            type: type.INTEGER,
            foreignKey: true,
            references: {
                model:'donors',
                key: 'idDonor'
            }
       },
       idVehicle: {
           type: type.INTEGER,
           foreignKey: true,
           references: {
               model:'vehicles',
               key: 'idVehicle'
           }
       },
        fechaAsignacion:{
            type: type.DATE,
            allowNull:false,
        },
        folio:{
            type:type.STRING,
        },
        longitud:{
            type: type.DOUBLE,
        },
        latitud:{
            type: type.DOUBLE,
        },
        fechaRecoleccion:{
            type: type.DATE,
        },
        responsableEntrega:{
            type: type.STRING,
        },
        nota:{
            type: type.BOOLEAN,
        },
        recolectado:{
            type: type.BOOLEAN,
        },
    },{
        paranoid:true
     }
    );
}