module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.tipo == "admin"){
            return next()
        }

        req.flash("error_msg", "Você precisa estar logado!")
        res.redirect("/")
    }
}