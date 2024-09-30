module.exports = app => {
    app.use('/peliculas', require('./peliculas.routes'))
    app.use('/personas', require('./personas.routes'))
    app.use('/reparto', require('./reparto.routes'))
};
