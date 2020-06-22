module.exports = {
    isLogado: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }
        req.session.oldUrl = req.url
        res.redirect("/usuarios/login")
    }
}