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
const Carrinho = require("../models/carrinho")
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
router.post("/edit" , isLogado, (req,res,next) =>{
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

//rota para meu perfil
router.get("/meusalugueis" , isLogado,(req, res) => {
    Aluguel.find({idCliente: req.user.id}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
        res.render("usuarios/meusalugueis", {aluguel: aluguel})
        }).catch((err) =>{
            req.flash("error_msg", "Erro:" +err)
            res.redirect('/')
        })
})

//TODO: rota para meus ferramentas
//FIXME: precisa mudar o model de ferramenta para identificar o proprietario. 
// Se for o caso
// router.get("/minhasferramentas" , (req, res) => {
//     res.render("usuarios/minhasferramentas")
// })

//rota direciona para aluguel com usuario e ferramenta definida
//FIXME: validar data de entrada, nao podera ser menor que data atual
//talvez definir periodos de aluguem em periodos  
router.get("/alugar/:id", isLogado, (req, res) => {
    Ferramenta.findOne({_id: req.params.id}).lean().then((ferramenta) => {
    res.render("usuarios/alugar", {ferramenta: ferramenta , dataAtual: Date()})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })
})

//rota adiciona aluguel
//FIXME: validar data de aluguel, adicionar tratativa de erro e redirecionar para aluguel com mensagem
router.post('/alugar/new', isLogado, (req,res) =>{
    var ferramenta = Ferramenta.findOne({_id: req.params.id})

        const novoAluguel = {
            idFerramenta: req.body.ferramenta,
            idCliente: req.body.usuario,
            dataRetirada: req.body.dataRetirada,
            dataDevolucao: req.body.dataDevolucao

        }
        new Aluguel (novoAluguel).save().then(()=>{
            req.flash("success_msg", 'Aluguel salvo com sucesso')
            res.redirect('/')
        }).catch((err) => {
            req.flash("error_msg", 'Erro ao salvar aluguel: ' + err)
        })
})


//adicionar no carrinho
router.get("/add/:id", (req, res, next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})
    Ferramenta.findById(idProduto).then((ferramenta) => {
        carrinho.add(ferramenta, ferramenta.id)
        req.session.carrinho = carrinho
        res.redirect("/")
    }).catch((err) =>{
        res.redirect("/")
        req.flash("error_msg" , "Erro ao adicionar no carrinho " + err )
    })
})

//rota para view do carrinho 
router.get("/carrinho", isLogado, (req,res) => {
    if(!req.session.carrinho){
        return res.render("usuarios/carrinho", {produtos : null})
    }
    var carrinho = new Carrinho(req.session.carrinho)
    res.render("usuarios/carrinho", {produtos: carrinho.gerarArray(), totalDeItens: carrinho.totalQtd})
})

//remover 1 item do carrinho
router.get("/removerum/:id" , (req,res,next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})

    carrinho.removerItem(idProduto)
    req.session.carrinho =  carrinho
    res.redirect("/usuarios/carrinho")
})

//remover 1 item do carrinho
router.get("/removertodos/:id" , (req,res,next) => {
    var idProduto = req.params.id
    var carrinho = new Carrinho(req.session.carrinho ? req.session.carrinho : {itens: {}})

    carrinho.removerTodos(idProduto)
    req.session.carrinho =  carrinho
    res.redirect("/usuarios/carrinho")
})

//rota para finalizar pedido
router.get("/pedido" ,isLogado , (req,res) =>{
    res.render("usuarios/pedido")
})

module.exports = router