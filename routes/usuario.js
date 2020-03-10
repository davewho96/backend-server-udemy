var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

//Obtener todos los usuarios
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargar usuario',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            })


});




//Actualizar Usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error cargar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)'
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});



//Crear un nuevo usuario
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

//Borrar usuario por id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'no existe ese usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;