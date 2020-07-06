//imports necessarios
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

//meus imports
require('../models/Ferramenta')
const Ferramenta = mongoose.model('Ferramenta')
require('../models/Usuario')
const Usuario = mongoose.model('Usuario')
require('../models/Aluguel')
const Aluguel = mongoose.model('Aluguel')
const Pedido = require('../models/Pedido')
const Carrinho = require('../models/carrinho')
const {eAdmin} = require("../helpers/eAdmin")



//TODO: inserir validações em todos os saves

//rota principal, tem que ser o index
router.get('/', eAdmin, (req,res)=>{
    res.render("index")
})

// router.get('/', (req,res)=>{
//     res.render("admin/index")
// })

//Rota usuarios {
    //view adiciona usuario
    router.get('/usuarios/add', eAdmin, (req,res)=>{
        res.render('admin/addusuarios')
    })
    
    //rota lista usuarios
    router.get('/usuarios', eAdmin, (req,res)=>{
        Usuario.find({}).lean().then((usuario)=>{
            res.render("admin/usuarios", {usuario: usuario})
        }).catch((err) =>{
            req.flash("error_msg" ,  "erro:" +err)
            res.redirect('/admin')
        })
    })

    //rota deletar usuario
    router.post("/usuarios/deletar", eAdmin, (req, res) => {
        Usuario.deleteOne({_id: req.body.id}).then(() =>{
            req.flash("success_msg", "Usuario deletado!")
            res.redirect("/admin/usuarios")
        }).catch((err) => {
            req.flash("error_msg" , "Erro ao deletar: " + err)
            res.redirect("/admin/usuarios")
        })
    })

    //rota editar usuarios
    router.get("/usuarios/edit/:id", eAdmin, (req, res) => {
        Usuario.findOne({_id:req.params.id}).lean().then((usuario) => {
        res.render("admin/editusuario", {usuario: usuario}) 
        }).catch((err) => {
            req.flash("error_msg" , "Este usuario não existe!")
            res.redirect("/admin/usuarios")
        })
    }) 

    //edita usuarios no bando
    //FIXME: adicionar validações  
    router.post("/usuarios/edit" , eAdmin, (req,res) => {

        Usuario.findOne({_id: req.body.id}).then((usuario) => {
            usuario.tipo = req.body.tipo
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

    //rota salva usuarios no banco
    router.post('/usuarios/new', eAdmin, (req,res) =>{
        const novoUsuario = {
            tipo: req.body.tipo,
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
        }

        bcrypt.genSalt(10, (erro, salt)=>{
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                if(erro){
                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                    res.redirect("/")
                }else{
                    novoUsuario.senha = hash
                    new Usuario (novoUsuario).save().then(() =>{
                        req.flash("success_msg", "Usuário salvo com sucesso!")
                        res.redirect("/")
                    }).catch((err) =>{
                        req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente " +err)
                        res.redirect("admin/")
                    })
                }
            })
        })

        // new Usuario (novoUsuario).save().then(()=>{
        //     req.flash("success_msg", 'Usuário salvo com sucesso!')
        //     res.redirect('/admin/usuarios')
        // }).catch((err) => {
        //     req.flash("error_msg",'Erro ao salvar usuário: ' + err)
        // })
    })

//} fim usuários

//rotas ferramentas {
    //rota lista ferramentas
        router.get('/ferramentas', eAdmin, (req,res)=>{
            Ferramenta.find({}).lean().then((ferramenta)=>{
                res.render("admin/ferramentas", {ferramenta: ferramenta})
            }).catch((err) =>{
                req.flash("error_msg", "Erro:" +err)
                res.redirect('/admin')
            })
        })
    
    //rota adiociona ferramenta
        router.get('/ferramentas/add', eAdmin, (req,res)=>{
            res.render('admin/addferramenta')
        })
    
    //rota editar ferramenta
        router.get("/ferramentas/edit/:id", eAdmin, (req, res) => {
            Ferramenta.findOne({_id:req.params.id}).lean().then((ferramenta) => {
            res.render("admin/editferramenta", {ferramenta: ferramenta}) 
            }).catch((err) => {
                req.flash("error_msg" , "Esta ferramenta não existe!")
                res.redirect("/admin/ferramentas")
            })
        }) 

    //edita ferramenta no bando 
        router.post("/ferramentas/edit" , eAdmin, (req,res) => {

            Ferramenta.findOne({_id: req.body.id}).then((ferramenta) => {
                ferramenta.ferramenta = req.body.ferramenta
                ferramenta.tipo = req.body.tipo
                ferramenta.modelo = req.body.modelo
                ferramenta.unidade = req.body.unidade

                ferramenta.save().then(() =>{
                    req.flash("success_msg", "Ferramenta editada!")
                    res.redirect("/admin/ferramentas")
                }).catch((err) => {
                    req.flash("error_msg", "01 - Erro ao salvar edicao! " + err)
                    res.redirect("/admin/ferramentas")
                })
            }).catch((err) => {
                req.flash("error_msg", "02 - Erro ao editar! " + err)
                res.redirect("/admin/ferramentas")
            })
        })
    //rota deletar ferramenta
        router.post("/ferramentas/deletar", eAdmin, (req, res) => {
            Ferramenta.deleteOne({_id: req.body.id}).then(() =>{
                req.flash("success_msg", "Ferramenta deletada!")
                res.redirect("/admin/ferramentas")
            }).catch((err) => {
                req.flash("error_msg" , "Erro ao deletar: " + err)
                res.redirect("/admin/ferramentas")
            })
        })
    //rota salva ferramenta no banco
        router.post('/ferramentas/new', eAdmin, (req,res) =>{
            const novaFerramenta = {
                ferramenta: req.body.ferramenta,
                tipo: req.body.tipo,
                modelo: req.body.modelo,
                unidade: req.body.unidade

            }
            new Ferramenta (novaFerramenta).save().then(()=>{
                req.flash("success_msg",'Ferramenta salva com sucesso!')
                res.redirect('/admin/ferramentas')
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar ferramenta: " + err)
            })
        })
//} fim ferramentas

//rotas aluguel {
    //rota lista aluguel
    router.get('/aluguel', eAdmin, (req,res)=>{
        Aluguel.find({}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
            res.render("admin/aluguel", {aluguel: aluguel})
        }).catch((err) =>{
            req.flash("error_msg", "erro:" +err)
            res.redirect('/admin')
        })
    })
    
     
    // edita aluguel
    router.get("/aluguel/edit/:id", eAdmin, (req, res) => {
        Aluguel.findOne({_id:req.params.id}).lean().then((aluguels) => {
            Usuario.find({}).lean().then((usuarios) => {
                Ferramenta.find({}).lean().then((ferramentas)=>{
                    Aluguel.find({}).lean().populate("idCliente").populate("idFerramenta").then((relacao)=>{
                        res.render("admin/editaluguel", {aluguels: aluguels,
                                                    ferramentas: ferramentas, 
                                                    usuarios: usuarios,
                                                    relacao: relacao})
                    }).catch((er) => {
                        req.flash("error_msg", "Erro 00ea: " + err)
                        res.redirect("/admin/aluguel")
                    })
                }).catch((err)=> {
                    req.flash("error_msg", "Erro 01ea: " + err)
                    res.redirect("/admin/aluguel")
                })

            }).catch ((err)=> {
                req.flash("error_msg", "Erro 02ea: " + err)
                res.redirect("/admin/aluguel")
            })
         
        }).catch((err) => {
            req.flash("error_msg" , "Este aluguel não existe!")
            res.redirect("/admin/aluguel")
        })
    })
    

    // editar aluguel no banco
    router.post("/aluguel/edit" , eAdmin, (req,res) => {

        Aluguel.findOne({_id: req.body.id}).then((aluguel) => {
            aluguel.idCliente = req.body.usuario
            aluguel.idFerramenta = req.body.ferramenta
            aluguel.dataRetirada = req.body.dataDevolucao
            aluguel.dataDevolucao = req.body.dataRetirada

            aluguel.save().then(() =>{
                req.flash("success_msg", "Aluguel editado!")
                res.redirect("/admin/aluguel")
            }).catch((err) => {
                req.flash("error_msg", "01 - Erro ao salvar edicao! " + err)
                res.redirect("/admin/aluguel")
            })
        }).catch((err) => {
            req.flash("error_msg", "02 - Erro ao editar! " + err)
            res.redirect("/admin/aluguel")
        })
    })

    //rota deletar aluguel
    router.post("/aluguel/deletar", eAdmin, (req, res) => {
        var quantidade = 1
        
        Ferramenta.updateOne({ferramenta: req.body.ferramenta}, {$inc: {unidade: quantidade}}, () =>{ 
            Aluguel.deleteOne({_id: req.body.id}).then(() =>{
                req.flash("success_msg", "aluguel deletado!")
                res.redirect("/admin/aluguel")
            }).catch((err) => {
                req.flash("error_msg" , "Erro ao deletar: " + err)
                res.redirect("/admin/aluguel")
            })
        })
    })

    //salva aluguel     
    router.post('/aluguel/new', eAdmin, (req,res) =>{
        var quantidade = 1 
        const novoAluguel = {
            idFerramenta: req.body.ferramenta,
            idCliente: req.body.usuario,
            dataRetirada: req.body.dataRetirada,
            dataDevolucao: req.body.dataDevolucao

        }
        
        Ferramenta.updateOne({_id: req.body.ferramenta}, {$inc: {unidade: -quantidade}}, () =>{ 
            new Aluguel (novoAluguel).save().then(()=>{
                req.flash("success_msg", 'Aluguel salvo com sucesso')
                res.redirect('/admin/aluguel')
            }).catch((err) => {
                req.flash("error_msg", 'Erro ao salvar aluguel: ' + err)
            })
        })
    })

    //rota adiciona aluguel
        router.get('/aluguel/add', eAdmin, (req,res)=>{
            Usuario.find({}).lean().then((usuario) => {
                Ferramenta.find({}).lean().then((ferramenta) =>{
                    res.render("admin/addaluguel", {ferramenta: ferramenta, usuario: usuario})
                    req.flash("success_msg", "Aluguel adicionado com sucesso!")
                })
                }).catch((err) => {
                    req.flash("error_msg", "erro ao exibir: " + err)
            })
        })
//} fim aluguel

//rota para listar todos os pedidos
router.get("/todospedidos", eAdmin, (req,res) => {
    Pedido.find().
    lean().
    populate("usuario").
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
        res.render("admin/pedidos/todospedidos", {pedidos: pedidos })
    })
})

// rota para pedidos em atraso
router.get("/pedidosematraso", eAdmin, (req,res) => {
    Pedido.find({dataDevolucao: {$lt: Date()}, devolvidoEm: {$eq: null}}).
    lean().
    populate("usuario").
    sort({dataDevolucao: 1}).
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
        res.render("admin/pedidos/pedidosematraso", {pedidos: pedidos })
    })
})

// rota para pedidos em devolvidos
router.get("/pedidosdevolvidos", eAdmin,  (req,res) => {
    Pedido.find({devolvidoEm: { $ne: null}}).
    lean().
    populate("usuario").
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
        res.render("admin/pedidos/pedidosdevolvidos", {pedidos: pedidos })
    })
})

//rota para devolver o pedido
router.get("/devolverpedido/:id" ,eAdmin,(req,res) => {
    Pedido.findOne({_id: req.params.id}).
    then((pedido) =>{
            carrinho = new Carrinho(pedido.carrinho)
            listaItens = carrinho.gerarArray()
            listaItens.forEach(atualizaVarios)
            function atualizaVarios (index, item) {
                var idItem = listaItens[item].item._id
                var qtdItem = listaItens[item].qtd
                Ferramenta.updateOne({_id: idItem}, {$inc: {unidade: qtdItem}}, () => { 
                })
            }
            Pedido.updateOne({_id: pedido._id}, {$set: {devolvidoEm: Date()}}, () => { 
            })
        req.flash("success_msg", "Pedido devolvido!")
        res.redirect("/admin/todospedidos")
    })
})

//rota para marcar aluguel como devolvido. 
router.get("/devolver/:id",eAdmin, (req, res) => {
    Aluguel.findById(req.params.id).then((aluguel) =>{
        Aluguel.updateOne({_id: aluguel._id}, {$set:{devolvidoEm: Date()}}, () => {
            Ferramenta.updateOne({_id: aluguel.idFerramenta}, {$inc: {unidade: 1}}, ()=> {
                req.flash("success_msg", "Item devolvido!")
                res.redirect("/admin/aluguel")
            })
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao devolver:" + err)
        res.redirect("/admin/aluguel")
    })
})

//404
router.get("*", (req, res) => {
    res.render("404")
})

//exportacao das rotas
module.exports = router