if (process.env.NODE_ENV == "production"){
    module.expors = {mongoURI: "mongodb+srv://herotools:@Mlab2020@cluster0.bsrny.mongodb.net/test"}
} else {
    module.exports = {mongoURI: "mongodb://localhost/herotools"}
}