const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Ferramenta')
const Ferramenta = mongoose.model('Ferramenta')
require('../models/Usuario')
const Usuario = mongoose.model('Usuario')
require('../models/Aluguel')
const Aluguel = mongoose.model('Aluguel')


//TODO: inserir validações em todos os saves


//rota principal, tem que ser o index
router.get('/', (req,res)=>{
    res.render("index")
})

router.get('/', (req,res)=>{
    res.render("admin/index")
})

//Rota usuarios {
    //view adiciona usuario
    router.get('/usuarios/add', (req,res)=>{
        res.render('admin/addusuarios')
    })
    
    //rota lista usuarios
    router.get('/usuarios', (req,res)=>{
        Usuario.find({}).lean().then((usuario)=>{
            res.render("admin/usuarios", {usuario: usuario})
        }).catch((err) =>{
            console.log("erro:" +err)
            res.redirect('/admin')
        })
    })

    //rota deletar usuario
    router.post("/usuarios/deletar", (req, res) => {
        Usuario.deleteOne({_id: req.body.id}).then(() =>{
            req.flash("success_msg", "Usuario deletado!")
            res.redirect("/admin/usuarios")
        }).catch((err) => {
            req.flash("error_msg" , "Erro ao deletar: " + err)
            res.redirect("/admin/usuarios")
        })
    })

    //rota editar usuarios
    router.get("/usuarios/edit/:id", (req, res) => {
        Usuario.findOne({_id:req.params.id}).lean().then((usuario) => {
        res.render("admin/editusuario", {usuario: usuario}) 
        }).catch((err) => {
            req.flash("error_msg" , "Este usuario não existe!")
            res.redirect("/admin/usuarios")
        })
    }) 

    //edita usuarios no bando 
    router.post("/usuarios/edit" , (req,res) => {

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

            usuario.save().then(() =>{
                req.flash("success_msg", "Usuario editado!")
                res.redirect("/admin/usuarios")
            }).catch((err) => {
                req.flash("error_msg", "01 - Erro ao salvar edicao! " + err)
                res.redirect("/admin/usuarios")
            })
        }).catch((err) => {
            req.flash("error_msg", "02 - Erro ao editar! " + err)
            res.redirect("/admin/usuarios")
        })
    })

    //rota salva usuarios no banco
    router.post('/usuarios/new', (req,res) =>{
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
        new Usuario (novoUsuario).save().then(()=>{
            console.log('Usuario salvo com sucesso')
            res.redirect('/admin/usuarios')
        }).catch((err) => {
            console.log('Erro ao salvar usuario: ' + err)
        })
    })

//} fim usuários

//rotas ferramentas {
    //rota lista ferramentas
        router.get('/ferramentas', (req,res)=>{
            Ferramenta.find({}).lean().then((ferramenta)=>{
                res.render("admin/ferramentas", {ferramenta: ferramenta})
            }).catch((err) =>{
                console.log("erro:" +err)
                res.redirect('/admin')
            })
        })
    
    //rota adiociona ferramenta
        router.get('/ferramentas/add', (req,res)=>{
            res.render('admin/addferramenta')
        })
    
    //rota editar ferramenta
        router.get("/ferramentas/edit/:id", (req, res) => {
            Ferramenta.findOne({_id:req.params.id}).lean().then((ferramenta) => {
            res.render("admin/editferramenta", {ferramenta: ferramenta}) 
            }).catch((err) => {
                req.flash("error_msg" , "Esta ferramenta não existe!")
                res.redirect("/admin/ferramentas")
            })
        }) 

    //edita ferramenta no bando 
        router.post("/ferramentas/edit" , (req,res) => {

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
        router.post("/ferramentas/deletar", (req, res) => {
            Ferramenta.deleteOne({_id: req.body.id}).then(() =>{
                req.flash("success_msg", "Ferramenta deletada!")
                res.redirect("/admin/ferramentas")
            }).catch((err) => {
                req.flash("error_msg" , "Erro ao deletar: " + err)
                res.redirect("/admin/ferramentas")
            })
        })
    //rota salva ferramenta no banco
        router.post('/ferramentas/new', (req,res) =>{
            const novaFerramenta = {
                ferramenta: req.body.ferramenta,
                tipo: req.body.tipo,
                modelo: req.body.modelo,
                unidade: req.body.unidade

            }
            new Ferramenta (novaFerramenta).save().then(()=>{
                console.log('ferramenta salva com sucesso')
                res.redirect('/admin/ferramentas')
            }).catch((err) => {
                console.log('Erro ao salvar ferramenta: ' + err)
            })
        })
//} fim ferramentas

//rotas aluguel {
    //rota lista aluguel
    router.get('/aluguel', (req,res)=>{
        Aluguel.find({}).lean().populate("idCliente").populate("idFerramenta").then((aluguel)=>{
            res.render("admin/aluguel", {aluguel: aluguel})
        }).catch((err) =>{
            console.log("erro:" +err)
            res.redirect('/admin')
        })
    })
    
     
    // edita aluguel
    router.get("/aluguel/edit/:id", (req, res) => {
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
    router.post("/aluguel/edit" , (req,res) => {

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
    router.post("/aluguel/deletar", (req, res) => {
        Aluguel.deleteOne({_id: req.body.id}).then(() =>{
            req.flash("success_msg", "aluguel deletado!")
            res.redirect("/admin/aluguel")
        }).catch((err) => {
            req.flash("error_msg" , "Erro ao deletar: " + err)
            res.redirect("/admin/aluguel")
        })
    })

    //salva aluguel     
    router.post('/aluguel/new', (req,res) =>{
        const novoAluguel = {
            idFerramenta: req.body.ferramenta,
            idCliente: req.body.usuario,
            dataRetirada: req.body.dataRetirada,
            dataDevolucao: req.body.dataDevolucao

        }
        new Aluguel (novoAluguel).save().then(()=>{
            console.log('Aluguel salva com sucesso')
            res.redirect('/admin/aluguel')
        }).catch((err) => {
            console.log('Erro ao salvar aluguel: ' + err)
        })
    })

    //rota adiciona aluguel
        router.get('/aluguel/add', (req,res)=>{
            Usuario.find({}).lean().then((usuario) => {
                Ferramenta.find({}).lean().then((ferramenta) =>{
                    res.render("admin/addaluguel", {ferramenta: ferramenta, usuario: usuario})
                })
                }).catch((err) => {
                    console.log("erro ao exibir: " + err)
            })
        })
//} fim aluguel

//404
router.get("*", (req, res) => {
    res.render("404")
})
//exportacao das rotas
module.exports = router