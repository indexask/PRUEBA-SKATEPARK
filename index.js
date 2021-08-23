//importaciones
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretkey = "shhh";

const { nuevoUsuario, validationLogin, getskaters, setSkaterStatus, updateSkater, deleteSkater} = require("./consultas");
const { request } = require("express");

app.listen(3000, () => console.log ("Servidor encendido!!!"));

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el limite permitido",
    })
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

//Rutas
app.get("/", function (req, res) {
    res.render("Home")
});

app.get("/registro", (req, res) => {
    res.render("registro");
});
  
 app.get("/login", (req, res) => {
    res.render("Login");
});
  
app.get("/admin", (req, res) => {
    res.render("Admin");
});

app.get("/datos", (req, res) => {
    const {token} = req.query
    if(!token) return res.status(403).send("no existe token en la consulta")
    jwt.verify(token, secretkey, (err, decoded)=>{
        if(err) return res.status(401).send(err.message)
        res.render("datos", {decoded : decoded.datosDeSkaters});
    })
});

app.post("/skaters", async (req, res) => {
    const { email, nombre, password, anos_de_experiencia, especialidad } = req.body;
    try {
        req.files.foto.mv(`./public/imagenes/${req.files.foto.name}`)
        const usuario =  nuevoUsuario(email, nombre, password, anos_de_experiencia, especialidad, req.files.foto.name);
        res.status(201).send(JSON.stringify(usuario));
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
})

app.put("/skaters/:id", async (req, res) => {
    const {id} = req.params
    const estado = req.body;
    try {
        const skater = await updateSkater(id, estado)
        res.status(200).send(JSON.stringify(skater));
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});
app.post("/login", async (req, res) => {
    const { email, password} = req.body;
    try {
        const datosDeSkaters = await validationLogin (email);
        if (datosDeSkaters) {
            if (datosDeSkaters.password == password){
                const token = jwt.sign({datosDeSkaters},secretkey)
                res.status(200).json({token})
            }else  return res.status(401).send("Skater no autorizado")
        }else return res.status(404).send("Skater no encontrado")
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.get("/skaters", async (req, res) => {
    try {
        const result = await getskaters()
        console.log(result)
        res.status(201).send(JSON.stringify(result));
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.delete("/skaters/:id", async (req, res) => {
    const {id} = req.params
    try {
        const deletedeSkater = await deleteSkater(id)
        res.status(200).send(deletedeSkater);
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.put("/skaterEstado/:id", async (req, res) => {
    const {id} = req.params
    const {estado} = req.body;
    console.log(estado)
    try {
        const skaterCheck = await setSkaterStatus(id, estado)
        res.status(200).send(skaterCheck);
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});