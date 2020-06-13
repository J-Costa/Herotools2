const mongoose = require('mongoose');


const UsuarioSchema = mongoose.Schema({ 
   tipo: {
       type: String,
       required: true, 
       default: "user"
   },
   email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        require: true
    },
   nome: {
       type: String,
       require: true
    },
    sexo: {
        type: String,
        require: true
    },
    rg: {
        type: Number,
        required: true
    },
    cpf: {
        type: Number, 
        required: true
    },
    /* data_nascimento: {
        type: Date,
        required: true
    }, */
    endereco: {
        type: String,
        required: true
    },
    bairro: {
        type: String,
        required: true
    },
    /* complemento: {
        type: String,
        required: true
    }, */
    cep: {
        type: Number,
        required: true
    },
    telefone: {
        type: Number,
        required: true
    },
    celular: {
        type: Number,
        requires: true
    }

});

const Usuario = module.exports = mongoose.model('Usuario', UsuarioSchema);