module.exports=(DB,type) => {
    return DB.define('user', {
        idUser:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreUsuario: {
            type: type.STRING
        },
        contrasena: {
             type: type.STRING,
             allowNull: false,
        }, 
        telefono: {
            type: type.STRING,
            allowNull: false,
            unique:true,
        },
        email: {
              type:type.STRING,
              allowNull: false,
              unique:true,
              validate:{
                  isEmail:true,
              }
        },
        nombre:{
            type: type.STRING,
            allowNull: false,
        },
        apellidoP :{
             type:type. STRING,
             allowNull: false,
         },
        apellidoM:{
            type: type.STRING,
         }
    },{
        paranoid:true
     }
    );
}