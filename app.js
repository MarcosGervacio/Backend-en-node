import express from "express"
import ProductManager from "./Managers/ProductManager.js"
import CartManager from "./Managers/CartManager.js"

const product = new ProductManager()
const cart = new CartManager()
const app = express()
app.use(express.json())

// http://localhost:8080/api/products  -  GET Obtiene todos los productos 
app.get("/api/products" , async (req, res) => {
    try {
    const productos = await product.mostrarProductos()
    res.json(productos)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
})

// http://localhost:8080/api/products/id  -  GET Obtiene un producto filtrando por id
app.get("/api/products/:id" , async (req, res) => {
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
app.post("/api/products", async (req, res) =>{
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
    }  catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/products/id  - delete  Elimina el producto
app.delete("/api/products/:id", async (req, res) =>{
    const { id } = req.params
    try{
        const productos = await product.mostrarProductos()
        const productoEliminado = productos.find(prod => prod.id === Number(id))
        if(!productoEliminado){
            return res.status(404).json({error: "producto no encontrado"})
        }else{
            await product.eliminarProducto(id)
            res.status(200).json({message: "producto eliminado", productoEliminado})
        }
    }  catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/products/id  - PUT body json  Actualiza el producto
app.put("/api/products/:id", async (req, res) =>{
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



//Carrito-----------------------------------------------------------------------------


// http://localhost:8080/api/carts/   - POST  se crea carrito
app.post("/api/carts", async (req, res) =>{
    try{
        await cart.crearCarrito()
        res.status(201).json({message: "Carrito creado"})
    }  catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/1   -   GET  se obtiene productos del carrito
app.get("/api/carts/:cid", async (req, res) =>{
    try{
        const { cid } = req.params
        const carrito =  await cart.obtenerCarrito(cid)
        if(!carrito){
            return res.status(404).json({error: "carrito no encontrado"})
        }else{
            res.status(200).json({message: "Carrito encontrado", carrito})
        }
    }  catch (error) {
        console.error("Error al encontrar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})


// http://localhost:8080/api/carts/:cid/product/:pid   -  POST  se agrega producto al carrito 
app.post("/api/carts/:cid/product/:pid", async (req, res) =>{
    try{
        const { cid, pid } = req.params
        const productos = await product.mostrarProductos()
        const productoEncontrado = productos.find(prod => prod.id === Number(pid))
        const carrito =  await cart.obtenerCarrito(cid)
        if(!productoEncontrado || !carrito){
            return res.status(404).json({error: "producto o carrito no encontrado"})
        }else{
            await cart.agregarProductos(cid, pid)
            res.status(201).json({message: "Se agrego el producto al carrito"})
        }
    }  catch (error) {
        console.error("Error al agregar productos al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

app.listen(8080, () => {
    console.log("servidor corriendo en el puerto http://localhost:8080")
})