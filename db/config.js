const mongoose  = require("mongoose");

const dbConnection = async() => {
    try {

        await mongoose.connect(process.env.BD_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
           // useCreateIndex: true
        });

//    await mongoose.connect(process.env.BD_CNN);

        console.log('BBDD on line');
        
    } catch (error) {
        console.log(error);
        throw new Error('Error al inicializar BBDD');
    }
}

module.exports = {
    dbConnection
}