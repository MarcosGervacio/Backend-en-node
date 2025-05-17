import { Router } from "express";
import productManager from "../../Managers/productManager.js"
import { productModel } from "../models/product.model.js";
import { socketServer } from "../app.js";

const product = new productManager()
const productRouter = Router()

// http://localhost:8080/api/products  -  GET Obtiene todos los productos 
productRouter.get("/api/products" , async (req, res) => {
    try {
    const { limit = 3, page = 1, sort, query } = req.query;


    const queryFilter = {};
    if (query) {
      const [field, value] = query.split(":");
      queryFilter[field] = value;
    }


    let opcionesOrden = {};
    if (sort === 'asc') {
      opcionesOrden = { price: 1 };
    } else if (sort === 'desc') {
      opcionesOrden = { price: -1 };
    }

    const opciones = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: opcionesOrden
    };

    const resultado = await productModel.paginate(queryFilter, opciones);

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
    const prevLink = resultado.hasPrevPage ? `${baseUrl}?page=${resultado.prevPage}&limit=${limit}` : null;
    const nextLink = resultado.hasNextPage ? `${baseUrl}?page=${resultado.nextPage}&limit=${limit}` : null;
    //const productos = await productModel.find()


    res.status(200).json({
      status: "success",
      payload: resultado.docs,
      totalPages: resultado.totalPages,
      page: resultado.page,
      hasPrevPage: resultado.hasPrevPage,
      hasNextPage: resultado.hasNextPage,
      prevLink,
      nextLink
    });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
})

// http://localhost:8080/api/products/id  -  GET Obtiene un producto filtrando por id
productRouter.get("/api/products/:id" , async (req, res) => {
    const { id } = req.params
    try {
        const producto = await productModel.findById(id)
        res.json(producto)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
})

// http://localhost:8080/api/products  - POST - body json
productRouter.post("/api/products", async (req, res) =>{
    try{
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || typeof title !== "string" ||
            !description || typeof description !== "string" ||
            !code || typeof code !== "string" ||
            typeof price !== "number" || isNaN(price) ||
            typeof status !== "boolean" ||
            typeof stock !== "number" || isNaN(stock) ||
            !category || typeof category !== "string" ||
            !Array.isArray(thumbnails)
        ) {
            return res.status(400).json({ error: "Faltan campos obligatorios o tienen tipos de datos incorrectos"});
        }

        const producto = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        delete producto.id;
        await productModel.create(producto);
        res.status(201).json({message: "producto agregado", producto})
        const productosPaginados = await productModel.paginate({}, { limit: 3, page: 1, lean: true });
        socketServer.emit("actualizarProductos", productosPaginados.docs);
    }  catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/products/id  - delete  Elimina el producto
productRouter.delete("/api/products/:id", async (req, res) =>{
    const { id } = req.params
    try{
        const productoEliminado = await productModel.deleteOne({_id: id})
        if (productoEliminado.deletedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json({message: "producto eliminado", productoEliminado})
        const productosPaginados = await productModel.paginate({}, { limit: 3, page: 1, lean: true });
        socketServer.emit("actualizarProductos", productosPaginados.docs);
    }  catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/products/id  - PUT body json  Actualiza el producto
productRouter.put("/api/products/:id", async (req, res) =>{
    try{
        const { id } = req.params
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || typeof title !== "string" ||
            !description || typeof description !== "string" ||
            !code || typeof code !== "string" ||
            typeof price !== "number" || isNaN(price) ||
            typeof status !== "boolean" ||
            typeof stock !== "number" || isNaN(stock) ||
            !category || typeof category !== "string" ||
            !Array.isArray(thumbnails)
        ) {
            return res.status(400).json({ error: "Faltan campos obligatorios o tienen tipos de datos incorrectos"});
        }

        const productoActualizado = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };
        
        await productModel.updateOne({ _id: id }, productoActualizado);
        res.status(200).json("producto actualizado");
    }  catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}) 

export default productRouter