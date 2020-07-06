// imports necessários
const express = require('express')
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
//debug
require("locus")

//meus imports
const mongoose = require('../models/Usuario')
const Usuario = mongoose.model("Usuario")
const Ferramenta = require('../models/Ferramenta')
const Aluguel = require('../models/Aluguel')
const Pedido = require("../models/Pedido")
const Carrinho = require("../models/carrinho")
const Reserva = require("../models/Reserva")
const {isLogado} = require("../helpers/isLogado")

//rota de registro de usuario
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

//resgistra novo usuario no banco
router.post("/registro", (req, res) => {

    var erros = []
    //validações
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido!"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null ){
        erros.push({texto: "E-mail inválido!"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ){
        erros.push({texto: "Senha inválida!"})
    }
    if( req.body.senha.length < 6 ){
        erros.push({texto: "Senha muito curta, ela deve conter no mínimo 6 caracteres!"})
    }

    if( req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas não conferem!"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro" , {erros: erros} )
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario) =>{
            if(usuario){
                req.flash("error_msg" , "Já existe uma conta com este e-mail em nosso sistema.")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    senha: req.body.senha,
                    email: req.body.email,
                    nome: req.body.nome,
                    sexo: req.body.sexo,
                    rg: req.body.rg,
                    cpf: req.body.cpf,
                    cep: req.body.cep,
                    endereco: req.body.endereco,
                    bairro: req.body.bairro,
                    telefone: req.body.telefone,
                    celular: req.body.celular
                })

                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }else{
                            novoUsuario.senha = hash
                            novoUsuario.save().then(() =>{
                                req.flash("success_msg", "Usuário salvo com sucesso!")
                                res.redirect("/")
                            }).catch((err) =>{
                                req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente")
                                res.redirect("usuarios/registro")
                            })
                        }
                    })
                })
                
            }

        }).catch( err => {
            req.flash("error_msg" , "Houve um erro interno")
            res.redirect("/")
        })
    }

})

//rota para o login
router.get("/login" , (req, res) =>{
    res.render("usuarios/login")
})

//rota logout
router.get("/logout", (req,res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})

// cria usuario logado, rota alternativa
// router.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/');
//   });


//cira usuario logado
router.post("/login" ,  passport.authenticate("local",{
        failureRedirect: "/usuarios/login",
        failureFlash: true
    }), (req,res,next) => {
        if(req.session.oldUrl){
            var oldurl = req.session.oldUrl
            req.session.oldUrl = null
            res.redirect("/usuarios"+oldurl)
        }else{
            res.redirect("/")
        }
    })



//rota para o perfil
router.get("/perfil", isLogado,(req,res) => {
    Aluguel.find({idCliente: req.user.id}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
    res.render("usuarios/perfil", {aluguel: aluguel})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })
})

//rota para meu perfil
router.get("/meuperfil" , (req, res) => {
    res.render("usuarios/meuperfil")
})

//rota para usuario editar seu perfil
//FIXME: adicionar validações
router.post("/edit" ,  (req,res,next) =>{
    Usuario.findOne({_id: req.user.id}).then((usuario) => {
        usuario.senha = req.body.senha
        usuario.email = req.body.email
        usuario.nome = req.body.nome
        usuario.sexo = req.body.sexo
        usuario.rg = req.body.rg
        usuario.cpf = req.body.cpf
        usuario.cep = req.body.cep
        usuario.endereco = req.body.endereco
        usuario.bairro = req.body.bairro
        usuario.telefone = req.body.telefone
        usuario.celular = req.body.celular

        bcrypt.genSalt(10, (erro, salt)=>{
            bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                if(erro){
                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                    res.redirect("/")
                }else{
                    usuario.senha = hash
                    new Usuario (usuario).save().then(() =>{
                        req.flash("success_msg", "Usuário salvo com sucesso!")
                        res.redirect("/")
                    }).catch((err) =>{
                        req.flash("error_msg", "Houve um erro ao editar o usuário, tente novamente " + err)
                        res.redirect("admin/")
                    })
                }
            })
        })
    })    
})

//rota para meus alugueis, lista alugueis unicos
router.get("/meusalugueis" , isLogado,(req, res) => {
    Aluguel.find({idCliente: req.user.id}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
        res.render("usuarios/meusalugueis", {aluguel: aluguel})
        }).catch((err) =>{
            req.flash("error_msg", "Erro:" +err)
            res.redirect('/')
        })
})

//rota para meus pedidos, alugueis com um ou mais itens
router.get("/meuspedidos",isLogado,  (req,res) => {
    Pedido.find({usuario: req.user}).
    lean().
    populate("usuario").
    sort({dataPedido: -1}).
    then((pedidos) => {
        var carrinho
        pedidos.forEach((pedido) => {
            carrinho = new Carrinho(pedido.carrinho)
            pedido.itens = carrinho.gerarArray()
            if(pedido.dataDevolucao < new Date()){
                pedido.emAtraso = true
            }else{
                pedido.emAtraso = false
            }
        })
        res.render("usuarios/meuspedidoscopy", {pedidos: pedidos })
    })

})


//rota direciona para aluguel com usuario e ferramenta definida
router.get("/alugar/:id", isLogado, (req, res) => {
    Ferramenta.findOne({_id: req.params.id}).lean().then((ferramenta) => {
    res.render("usuarios/alugar", {ferramenta: ferramenta , dataAtual: Date()})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })
})

//rota adiciona aluguel
router.post('/alugar/new', isLogado, (req,res) =>{
        var quantidade = 1

        const novoAluguel = {
            idFerramenta: req.body.ferramenta,
            idCliente: req.body.usuario,
            dataRetirada:  req.body.dataRetirada,
            dataDevolucao: req.body.dataDevolucao,
        }
        
        Ferramenta.updateOne({_id: req.body.ferramenta}, {$inc: {unidade: -quantidade}}, () =>{
            Reserva.updateOne({usuario: req.user, 
                                ferramenta: req.body.ferramenta},
                                {$set: {isAtivo: false}}).then(() => {
            })
            new Aluguel (novoAluguel).save().then(()=>{
                req.flash("success_msg", 'Aluguel salvo com sucesso')
                res.redirect('/')
            }).catch((err) => {
                req.flash("error_msg", 'Erro ao salvar aluguel: ' + err)
            })
        })
})


//adicionar no carrinho
router.get("/add/:id", (req, res, next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})
        
            Ferramenta.findById(idProduto).then((ferramenta) => {
                carrinho.add(ferramenta, ferramenta.id)
                if(carrinho.itens[idProduto].qtd > ferramenta.unidade){
                    req.flash("error_msg", "Já adicionou o máximo disponivel no carrinho")
                    carrinho.removerItem(idProduto)
                }
                req.session.carrinho = carrinho
                res.redirect("/")
                    
                }).catch((err) =>{
                    res.redirect("/")
                    req.flash("error_msg" , "Erro ao adicionar no carrinho " + err )
                })
                
})

//rota para view do carrinho 
router.get("/carrinho",  (req,res) => {
    if(!req.session.carrinho){
        return res.render("usuarios/carrinho", {produtos : null})
    }
    var carrinho = new Carrinho(req.session.carrinho)
    res.render("usuarios/carrinho", {produtos: carrinho.gerarArray(),
    totalDeItens: carrinho.totalQtd, 
    dataAtual: Date()
    })
})

//remover 1 item do carrinho
router.get("/removerum/:id" , (req,res,next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})

    carrinho.removerItem(idProduto)
    req.session.carrinho =  carrinho
    res.redirect("/usuarios/carrinho")
})

//remover todos item do carrinho
router.get("/removertodos/:id" , (req,res,next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})

    carrinho.removerTodos(idProduto)
    req.session.carrinho =  carrinho
    res.redirect("/usuarios/carrinho")
})

//rota para finalizar pedido
//INFO: o pedido está sendo finalizado no carrinho
// router.get("/pedido" ,isLogado , (req,res) =>{
//     var carrinho = new Carrinho(req.session.carrinho)

//     var pedido = new Pedido({
//         usuario: req.user,
//         carrinho: carrinho
        
//     })
//     res.render("usuarios/pedido", {pedido: pedido.toObject()})
// })

//rota para realizar o pedido e salvar no banco
router.post("/pedido/new" ,isLogado , (req,res) =>{
    if(!req.session.carrinho){
        res.redirect("/usuarios/carrinho")
    }

    var carrinho = new Carrinho(req.session.carrinho)
    var pedido = new Pedido({
        usuario: req.user.id,
        carrinho: carrinho,
        dataRetirada:  req.body.dataRetirada,
        dataDevolucao:  req.body.dataDevolucao
    })
        pedido.save(pedido)
        .then(() => {
            listaItens = carrinho.gerarArray()
            listaItens.forEach(atualizaVarios)
            function atualizaVarios (index, item) {
                var idItem = listaItens[item].item._id
                var qtdItem = listaItens[item].qtd
                Ferramenta.updateOne({_id: idItem}, {$inc: {unidade: -qtdItem}}, () => { 
                })
            }
            req.flash("success_msg", "Pedido realizado com sucesso!")
            req.session.carrinho = null
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao realizar o pedido! " + err)
            res.redirect("/")
        })
})

//rota para view reservar ferramenta
router.get("/reservar/:id" ,isLogado, (req,res) =>{
    Aluguel.
    find({idFerramenta: req.params.id, devolucaoEm: undefined}).
    lean().
    populate("idFerramenta").
    populate("idCliente").
    sort({dataDevolucao: -1}).
    limit(1).
    then((aluguel) =>{
        res.render("usuarios/reservar", {aluguel: aluguel  ,user: req.user.toObject()})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })

})

//rota para logica de salvar reserva
router.post("/reservar/:id", (req,res) => {
    Reserva.find({ferramenta: req.params.id}).sort({fila: -1}).limit(1).then((achaReserva) =>{
        if(achaReserva[0] != undefined){
        novaPosicao = achaReserva[0].fila+1
            reserva = new Reserva({
            fila : novaPosicao,
            usuario : req.user._id,
            ferramenta : req.params.id,
            dataReserva : Date(),
            isAtivo : true
        })
        reserva.save(reserva).then(() => {
            req.flash("success_msg", "Ferramenta reservada!")
            res.redirect("/usuarios/reservar/" + req.params.id)
        }).catch((err) => {
            req.flash("error_msg", "Erro ao reservar: " + err)
            res.redirect("/")
        })
    }else{
        reserva = new Reserva({
            fila : 1,
            usuario : req.user._id,
            ferramenta : req.params.id,
            dataReserva : Date(),
            isAtivo : true
        })
        reserva.save(reserva).then(() => {
            req.flash("success_msg", "Ferramenta reservada!")
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao reservar: " + err)
            res.redirect("/" )
        })
    }
    }).catch((err) => {
        req.flash("error_msg" , "erro: " + err)
        res.redirect("/")
    })
})

//rota para minhas reservas
router.get("/minhasreservas",isLogado, (req,res) => {
    Reserva.find({usuario: req.user}).
    lean().
    populate("ferramenta").
    then((reservas) =>{

        res.render("usuarios/minhasreservas", {reservas: reservas})
    })
})

//rota para cancelar a reserva
router.post("/cancelarreserva/:id",isLogado, (req,res) => {
    Reserva.updateOne({_id: req.params.id}, {$set:{isAtivo: false}}).then(() =>{
        req.flash("success_msg", "Reserva cancelada!")
        res.redirect("/usuarios/minhasreservas")
    })
    

})
module.exports = router