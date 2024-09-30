module.exports = (sequelize, Sequelize) => {
    const Reparto = sequelize.define("reparto", {
        movieId: {
            type: Sequelize.INTEGER,  // Clave foránea de la película
            allowNull: false,
            references: {
                model: 'peliculas',  // Referencia a la tabla de películas
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        personaId: {
            type: Sequelize.INTEGER,  // Clave foránea de la persona
            allowNull: false,
            references: {
                model: 'personas',  // Referencia a la tabla de personas
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        esDirector: {
            type: Sequelize.BOOLEAN,  
            defaultValue: false
        }
    });

    return Reparto;
};
