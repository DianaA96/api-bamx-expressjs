module.exports  = (DB, type) => {
    return DB.define('Donante', {
        IdDonante: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Nombre: {
            type: type.STRING,
            noEmpty: true,
        },
        numTelefono: {
            type: type.STRING,
            noEmpty: true,
        },
        Ubicacion: {
            type: type.STRING,
            noEmpty: true,
        },
    },
    {
    paranoid: true //permite soft delete
    })
};