const {response} = require('express');
const { validationResult } = require('express-validator');
const { baseModelName } = require('../models/Usuario');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async (req, res) => {
  
    const { name, email, password} = req.body;
    console.log('Campos desestructurados', name, email, password);

    try {
        //Verificar el email
        const usuario = await Usuario.findOne({email:email});

        if ( usuario ){
            return res.status(400).json({
                ok:false,
                msg:'El usuario ya existe con ese email.'
            });
        }

        //Crear usuario con el modelo 
        const dbUser = new Usuario(req.body);
        
        //Encriptar Hashear la contraseña
        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync(password, salt);

        //Generar json web token
        console.log('vamos a generar jwt');
        const token = await generarJWT(dbUser.id, name);
        
        console.log('Lo hemos generado');

        //Crear usuario de BBDD 
        await dbUser.save();

        //Generar respuesta exitosa   
        return res.status(201).json({
            ok:true,
            uid:dbUser.id,
            name: name,
            token
            //msg:'El usuario se ha generado correctamente: '
        });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            ok:false,
            msg:'Algo salio mal. Contacte con el administrador'
       });       
    }

};

const loginUsuario = async(req, res) => {

    const { email, password} = req.body;
    console.log('Campos desestructurados', email, password);

    try {
        const dbUser = await Usuario.findOne({email: email});

        if (!dbUser){
            return res.status(400).json({
                ok:false,
                msg: 'El correo no exite'
            });
        }

        //confirmar si el pwd hace match
        const validPassword = bcrypt.compareSync(password, dbUser.password);

        if (!validPassword){
            return res.status(400).json({
                ok:false,
                msg: 'El password no exite o no es válido'
            });
        }

        //Generar jwt
        const token = await generarJWT(dbUser.id, dbUser.name);

        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            token,
            msg: 'El login se ha producido correctamente'
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el login. Hable con el administrador.'
        });
    }
}

const revalidarToken = async(req, res) => {

    const {uid, name} = req;

    console.log(uid, name);

    //Generar jwt
   const token = await generarJWT(uid, name);

    return res.json({
        ok:true,
        uid,
        name,
        token,
        msg:'Renew'
    })
}

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}