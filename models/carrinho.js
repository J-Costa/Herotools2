module.exports = function Carrinho(velhoCarrinho) {
    this.itens = velhoCarrinho.itens || {}
    this.totalQtd = velhoCarrinho.totalQtd || 0
    
    this.add = function (item, id) {
        var storedItem = this.itens[id]
        if (!storedItem) {
            storedItem = this.itens [id] = {item : item, qtd: 0 }
        }
        storedItem.qtd++
        this.totalQtd++
    }

    this.removerItem = function (id) {
        this.itens[id].qtd--
        this.totalQtd--

        if(this.itens[id].qtd <= 0) {
            delete this.itens[id]
        }
    }

    this.removerTodos = (id) => {
        this.totalQtd -= this.itens[id].qtd
        delete this.itens[id]
    }

    this.gerarArray =  function () {
        var arr = []
        for (var id in this.itens){
            arr.push (this.itens[id])
        }
        return arr
    }
}