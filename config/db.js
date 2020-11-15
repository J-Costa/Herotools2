if (process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://teste:teste123@cluster.bsrny.mongodb.net/herotools?retryWrites=true&w=majority"}
    console.log("Produção")
} else {
    module.exports = {mongoURI: "mongodb://localhost/herotools"}
    console.log("local")
}