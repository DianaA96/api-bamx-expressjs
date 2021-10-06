module.exports=(DB,type) => {
    return DB.define('collection', {
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
            allowNull:false
        },
        longitud:{
            type: type.DOUBLE,
            allowNull:false
        },
        latitud:{
            type: type.DOUBLE,
            allowNull:false
        },
        fechaRecoleccion:{
            type: type.DATE,
            allowNull:false
        },
        responsableEntrega:{
            type: type.STRING,
            allowNull:false
        },
        nota:{
            type: type.BOOLEAN,
            allowNull:false
        },
        recolectado:{
            type: type.BOOLEAN,
            allowNull: false,
        },
    },{
        paranoid:true
     }
    );
}