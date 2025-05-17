import express from "express"
import cartRouter from "./routes/cartRouter.js"
import productRouter from "./routes/productRouter.js"
import _dirname from "./utils.js"
import Handlebars from "express-handlebars"
import { promises as fs } from "fs";
import { Server } from "socket.io";
import mongoose from "mongoose"
import { productModel } from "./models/product.model.js";
import { cartModel } from "./models/cart.model.js";


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
    const { limit = 3, page = 1 } = req.query;


    const resultado = await productModel.paginate({}, {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true
    });

    res.render("realTimeProducts", {
      productos: resultado.docs,
      totalPages: resultado.totalPages,
      prevPage: resultado.prevPage,
      nextPage: resultado.nextPage,
      page: resultado.page,
      hasPrevPage: resultado.hasPrevPage,
      hasNextPage: resultado.hasNextPage
    });
  } catch (error) {
    console.error("Error al paginar productos:", error);
    res.status(500).send("Error interno");
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const producto = await productModel.findById(req.params.id).lean();

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("product", { producto }); 
  } catch (error) {
    console.error("Error al renderizar el producto:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/cart/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const carrito = await cartModel.findById(cid).populate("products.product").lean();

    if (!carrito) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", { carrito });
  } catch (error) {
    console.error("Error al cargar carrito:", error);
    res.status(500).send("Error interno del servidor");
  }
});

mongoose.connect("mongodb+srv://marger96vm:pe3EjAWYu1pdpG0a@cluster0.jaoerii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

socketServer.on("connection", socket => {
    console.log("Cliente conectado");
});
export { socketServer };