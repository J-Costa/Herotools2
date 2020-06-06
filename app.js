//Carregando Módulos
    const express= require('express');
    const handleBars= require('express-handlebars');
    const bodyParser= require('body-parser');
    const mongoose= require('mongoose');
    const app= express();
    const admin = require('./routes/admin');
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')

    const handlebars = require("handlebars")

//Configurações
    //configurar sessao
        app.use(session({
            secret: "segredo",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })
    //Body parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    
    //Handlebars
         app.engine('handlebars', handleBars({defaultLayout: 'main'}));
         app.set('view engine', 'handlebars');
         

    
    //Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect("mongodb://localhost/herotools", {useUnifiedTopology: true, useNewUrlParser: true}).then(()=>{
        console.log("Conectado ao mongoDB")
    }).catch((err)=>{
        console.log("Erro: " +err)
    })

    //Public arquivos estáticos
        app.use(express.static(path.join(__dirname, 'public')));

    //middleware
        app.use((req, res, next) => {
            next();
        })
        
//Rotas
    app.use('/admin', admin);

//Outros
const port = 3000
app.listen(port, () =>{
    console.log('servidor rodando');
});

module.exports.register = handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
