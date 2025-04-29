import { Router } from "express";
import productManager from "../Managers/productManager.js"
import { socketServer } from "../src/app.js";

const product = new productManager()
const productRouter = Router()

// http://localhost:8080/api/products  -  GET Obtiene todos los productos 
productRouter.get("/api/products" , async (req, res) => {
    try {
    const productos = await product.mostrarProductos()
    res.json(productos)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
})

// http://localhost:8080/api/products/id  -  GET Obtiene un producto filtrando por id
productRouter.get("/api/products/:id" , async (req, res) => {
    const { id } = req.params
    try {
        const productos = await product.mostrarProductos()
        const productoEncontrado = productos.find(prod => prod.id === Number(id))
        if(!productoEncontrado){
            return res.status(404).json({error: "producto no encontrado"})
        }else{
            res.json(productoEncontrado)
        }
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
        await product.crearProducto(producto)
        res.status(201).json({message: "producto agregado", producto})
        const productos = await product.mostrarProductos();
        socketServer.emit("actualizarProductos", productos);
    }  catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/products/id  - delete  Elimina el producto
productRouter.delete("/api/products/:id", async (req, res) =>{
    const { id } = req.params
    try{
        const productos = await product.mostrarProductos()
        const productoEliminado = productos.find(prod => prod.id === Number(id))
        if(!productoEliminado){
            return res.status(404).json({error: "producto no encontrado"})
        }else{
            await product.eliminarProducto(id)
            const productos = await product.mostrarProductos();
            socketServer.emit("actualizarProductos", productos);
            res.status(200).json({message: "producto eliminado", productoEliminado})
        }
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
        
        if (!productoActualizado || Object.keys(productoActualizado).length === 0) {
            return res.status(400).json({ error: "No se enviaron datos para actualizar" });
        }
        delete productoActualizado.id;
        const productos = await product.mostrarProductos()
        const index = productos.findIndex(prod => prod.id === Number(id));
            if (index === -1) {
                return res.status(404).json({error: "producto no encontrado"})
            }else{
                await product.actualizarProducto(id, productoActualizado);
        res.status(200).json("producto actualizado");
            }
    }  catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}) 

export default productRouter