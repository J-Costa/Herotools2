const mongoose = require('mongoose');


const AluguelSchema = mongoose.Schema({ 
    idCliente: {
        type: mongoose.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    idFerramenta: {
        type: mongoose.Types.ObjectId,
        ref: "Ferramenta",
        required: true
    },
    dataRetirada: {
        type: Date,
        require: true,
        default: Date().now 
    },
    dataDevolucao: {
        type: Date,
        require: true
    },
    devolvidoEm: {type: Date, default: undefined }
});

const Aluguel = module.exports = mongoose.model('Aluguel', AluguelSchema);