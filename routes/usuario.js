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
    //FIXME: nao está validando o tamanho da senha
    if( req.body.senha < 4 ){
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
router.post("/login" , (req,res, next) => {
    passport.authenticate("local",{
        successRedirect: "/" , 
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next )
})

//rota direciona para aluguel com usuario e ferramenta definida 
router.get("/alugar/:id", (req, res) => {
    Ferramenta.findOne({_id: req.params.id}).lean().then((ferramenta) => {
    res.render("usuarios/alugar", {ferramenta: ferramenta})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })
})

//rota para o perfil
router.get("/perfil", (req,res) => {
    Aluguel.find({idCliente: req.user.id}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
    res.render("usuarios/perfil", {aluguel: aluguel})
    }).catch((err) =>{
        req.flash("error_msg", "Erro:" +err)
        res.redirect('/')
    })
})

//rota adiciona aluguel
router.post('/alugar/new', (req,res) =>{
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

module.exports = router