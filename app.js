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
    require('./models/Ferramenta')
    const Ferramenta = mongoose.model('Ferramenta')
    const usuarios = require('./routes/usuario');
    const passport = require("passport")
    require("./config/auth")(passport)
    

//Configurações
    //configurar sessao
        app.use(session({
            secret: "segredo",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash("error")
            if(req.user){
            res.locals.user = req.user.toObject() || null;
            res.locals.session = req.session
            }
            next()
        })
    //Body parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    
    //Handlebars
        const hbs = handleBars.create({
            defaultLayout: 'main',

            //Helper customizados
            helpers: {
                //formatar data
                dateFormat2: (data) =>{
                    data = new Date(data)
                    var dia = data.getDate()
                    var mes = (data.getMonth()+1)
                    var ano = data.getFullYear()
                    if(dia <= 9){
                        dia = "0" + dia
                    }

                    if(mes <= 9){
                        mes = "0" + mes
                    }
                    return ano +"-"+ mes +"-"+ dia //retorna "AAA-MM-DD"
                },
                dateFormat: (data) =>{
                    data = new Date(data)
                    var dia = data.getDate()
                    var mes = (data.getMonth()+1)
                    var ano = data.getFullYear()
                    if(dia <= 9){
                        dia = "0" + dia
                    }

                    if(mes <= 9){
                        mes = "0" + mes
                    }
                    return dia +"/"+ mes +"/"+ ano //retorna "DD-MM-AAAA"
                },
                json: (context) =>{
                    return JSON.stringify(context);
                },

                ifvalue: function(conditional, options) {
                    if (conditional == options.hash.equals) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                }
                    
            }

        })

         app.engine('handlebars', hbs.engine);
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

//Rotas
    //pagina principal, carrega ferramentas
    app.get("/" , (req,res) => {
        Ferramenta.find({}).lean().then((ferramenta) => {
        res.render('index', {ferramenta: ferramenta})
        })
    })
    
    app.use('/admin', admin);
    app.use("/usuarios", usuarios)
    
    //rota para página nao encontrada
    // app.get("*" , (req,res) =>{
    //     res.render('404')
    // })

//Outros
const port = 3000
app.listen(port, () =>{
    console.log('Servidor rodando na porta: ' + port);
});

