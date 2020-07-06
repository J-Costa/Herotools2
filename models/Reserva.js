const mongoose = require('mongoose');


const ReservaSchema = mongoose.Schema({ 
    fila: {type: Number, required: true},
    usuario: {type: mongoose.Types.ObjectId, ref: "Usuario", require: true}, 
    ferramenta: {type:mongoose.Types.ObjectId, ref: "Ferramenta", required: true },
    dataReserva: {type: Date, dafault: Date()},
    isAtivo: {type: Boolean, required: true}
});

const Reserva = module.exports = mongoose.model('Reserva', ReservaSchema);