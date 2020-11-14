//Carregando Módulos
    //modulos necessarios
    const express= require('express');
    const handleBars= require('express-handlebars');
    const bodyParser= require('body-parser');
    const mongoose= require('mongoose');
    const app= express();
    const admin = require('./routes/admin');
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')
    const passport = require("passport")

    //meus modulos
    require('./models/Ferramenta')
    const Ferramenta = mongoose.model('Ferramenta')
    const usuarios = require('./routes/usuario');
    require("./config/auth")(passport)
    const db = require('./config/db')

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
                    var ano = data.getFullYear()
                    var mes = data.getMonth()+1
                    var dia = data.getDate()
                    if (dia < 10){
                        dia =  "0" + dia
                    }
                    
                    if (mes < 10){
                        mes =  "0" + mes
                    }
                    
                    return ano +"-"+ mes +"-"+ dia //retorna "AAAA-MM-DD"
                },
                dateFormat: (data) =>{
                    data = new Date(data).toISOString()
                    var ano = data.slice(0,4)
                    var mes = data.slice(5,7)
                    var dia = data.slice(8,10)
                    
                    return dia +"/"+ mes +"/"+ ano //retorna "DD/MM/AAAA"
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
    mongoose.connect(db.mongoURI, {useUnifiedTopology: true, useNewUrlParser: true}).then(()=>{
        console.log("Conectado ao mongoDB")
    }).catch((err)=>{
        console.log("Erro: " +err)
    })

    //Public arquivos estáticos
        app.use(express.static(path.join(__dirname, 'public')));
        
        //Rotas
        //pagina principal, carrega ferramentas
        //FIXME: corrigir
        page = 1
    app.get("/" , (req,res) => {
        Ferramenta.countDocuments({}).lean().then((counter) => {
            seta = req.query
            search = req.query.busca
            const page_size = 9
            if (seta.next == 1){
                if (page < maxPages){
                    page ++
                } else {
                    page = maxPages
                }
            }
            if (seta.prev == 1){
                page --
                if (page == 0) page = 1
            }
            maxPages = Math.round(counter / page_size, 0)
            const skip = (page - 1) * page_size
            if (search){
                Ferramenta.find({$or: [{tipo: {$regex: new RegExp(search, "i")}},
                {modelo: {$regex: new RegExp(search, "i")}}]})
                .lean()
                .limit(page_size)
                .then((ferramenta) => {
                res.render('index', {ferramenta: ferramenta, layout: 'main2'})
                })
            } else {
                Ferramenta.find({})
                .skip(skip)
                .limit(page_size)
                .lean()
                .then((ferramenta) => {
                res.render('index', {ferramenta: ferramenta, layout: 'main2'})
                })
            }
        })
    })

    app.use('/admin', admin);
    app.use("/usuarios", usuarios)
    
    //FIXME: reativar ao "concluir"
    // rota para página nao encontrada
    app.get("*" , (req,res) =>{
        res.render('404')
    })

//Outros
const port = process.env.PORT || 3000
app.listen(port, () =>{
    console.log('Servidor rodando na porta: ' + port);
});

