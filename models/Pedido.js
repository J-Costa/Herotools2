const mongoose = require('mongoose');
const Usuario = require('./Usuario');


const PedidoSchema = mongoose.Schema({ 
  usuario: {type: mongoose.Types.ObjectId, ref: 'Usuario'},
  carrinho: {type: Object, required: true},
  dataRetirada: {type: Date, required: true},
  dataDevolucao: {type: Date, required: true},
  devolvidoEm: {type: Date, default: undefined },
  dataPedido: {type: Date, default: Date.now()}
});

const Pedido = module.exports = mongoose.model('Pedido', PedidoSchema);