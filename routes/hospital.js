var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ========================================================
// Obtener todos los hospitales
// ========================================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}).skip(desde).limit(5).populate('usuario', 'nombre email').exec((err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
        }
        Hospital.count({}, (err, conteo) => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        });
    })
});
// ========================================================
// Final Obtener todos los hospitales
// ========================================================

// ========================================================
// Obtener un hospital
// ========================================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
});
// ========================================================
// Final Obtener un hospital
// ========================================================

// ========================================================
// Actualizar hospital
// ========================================================
app.put('/:id', mdAutenticacion.VerificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al obtener hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        })
    });
});
// ========================================================
// Final Actualizar hospital
// ========================================================

// ========================================================
// Crear un nuevo hospital
// ========================================================
app.post('/', mdAutenticacion.VerificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});
// ========================================================
// Final Crear un nuevo hospital
// ========================================================

// ========================================================
// Borra un hospital
// ========================================================
app.delete('/:id', mdAutenticacion.VerificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});
// ========================================================
// Final Borra un hospital
// ========================================================

module.exports = app;