const mongoose = require('mongoose');


const FerramentaSchema = mongoose.Schema({ 
   ferramenta: { //endereço da imagem como teste
       type: String,
       required: true
   },
   tipo: {
        type: String,
    required: true
    },
   modelo: {
       type: String,
       require: true
    },
    unidade: {
        type: Number,
        require: true
    }
});

const Ferramenta = module.exports = mongoose.model('Ferramenta', FerramentaSchema);