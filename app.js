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
        const hbs = handleBars.create({
            defaultLayout: 'main',

            //Helper customizados
            helpers: {
                //formatar data
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
                    return dia +"/"+ mes +"/"+ ano //TODO: se ordem de salvamento está correta
                },
                json: (context) =>{
                    return JSON.stringify(context);
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

    //middleware
        app.use((req, res, next) => {
            next();
        })
        
//Rotas
    //pagina principal, carrega ferramentas
    app.get("/" , (req,res) => {
        Ferramenta.find({}).lean().then((ferramentas) => {
        res.render('index', {ferramentas: ferramentas})
        })
    })
    
    app.use('/admin', admin);
    
    app.get("*" , (req,res) =>{

        res.render('404')
    })

//Outros
const port = 3000
app.listen(port, () =>{
    console.log('servidor rodando');
});

