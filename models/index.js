const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: "mysql",
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.peliculas = require("./Peliculas.js")(sequelize, Sequelize);
db.personas = require("./persona.model.js")(sequelize, Sequelize);
db.reparto = require("./reparto.model.js")(sequelize, Sequelize);

// Película -> Reparto (una película tiene un reparto, relación uno a muchos)
db.peliculas.hasMany(db.reparto, { as: "reparto", foreignKey: "movieId" });
db.reparto.belongsTo(db.peliculas, { foreignKey: "movieId", as: "pelicula" });

// Reparto -> Persona (un reparto puede tener una persona)
db.personas.hasMany(db.reparto, { as: "repartos", foreignKey: "personaId" });
db.reparto.belongsTo(db.personas, { foreignKey: "personaId", as: "persona" });

module.exports = db;
