module.exports = (sequelize, Sequelize) => {
    const Pelicula = sequelize.define("pelicula", {
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        sinopsis: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        fecha_lanzamiento: {
            type: Sequelize.DATE,
            allowNull: false
        },
        calificacion_rotten_tomatoes: {
            type: Sequelize.FLOAT, 
            allowNull: false
        },
        trailer_youtube: {
            type: Sequelize.STRING, 
            allowNull: true
        }
    });

    return Pelicula;
};
