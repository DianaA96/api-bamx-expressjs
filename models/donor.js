module.exports=(DB,type) => {
    return DB.define('donor', {
        idDonor:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre:{
            type: type.STRING,
        },
        determinante: {
            type: type.STRING,
            allowNull: false,
        },
        tipo:{
            type: type.ENUM('Recurrente','Extraordinario','Unico'),
        },
        idRoute:{
            type: type.INTEGER,
            foreignKey: true,
            references:{
                model: 'routes',
                key: 'idRoute'
            }
        },
        cp:{
            type: type.INTEGER,
            allowNull: false,
        },
        estado:{
            type: type.STRING,
            allowNull: false,
        },
        municipio:{
            type: type.STRING,
            allowNull: false,
        },
        colonia:{
            type: type.STRING,
            allowNull: false,
        },
        calle: {
            type: type.STRING,
            allowNull: false,
        },
        numExterior:{
            type: type.INTEGER,
            allowNull: false
        }
    },{
        paranoid:true
    }
    );
}