import express from "express"
import cartRouter from "../routes/cartRouter.js"
import productRouter from "../routes/productRouter.js"
import _dirname from "./utils.js"
import Handlebars from "express-handlebars"
import { promises as fs } from "fs";
import { Server } from "socket.io";


const app = express();
const httpServer = app.listen(8080, () => {
    console.log("servidor corriendo en el puerto http://localhost:8080")
})
const socketServer = new Server(httpServer)

app.use(express.static(_dirname + "/public"));
app.engine("handlebars", Handlebars.engine());
app.set("views", _dirname + "/views")
app.set("view engine", "handlebars");


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", productRouter);
app.use("/", cartRouter);

app.get("/realTimeProducts", async (req, res) => {
    try {
        const data = await fs.readFile(_dirname + "/../products.json", "utf-8")
        const productos = JSON.parse(data);
        res.render("realTimeProducts", {productos});
    } catch (error) {
        console.error("Error al leer productos:", error);
    }
})


socketServer.on("connection", socket => {
    console.log("Cliente conectado");
});
export { socketServer };