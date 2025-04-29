import { Router } from "express";
import cartManager from "../Managers/cartManager.js"


const cart = new cartManager()
const cartRouter = Router()


// http://localhost:8080/api/carts/   - POST  se crea carrito
cartRouter.post("/api/carts", async (req, res) =>{
    try{
        await cart.crearCarrito()
        res.status(201).json({message: "Carrito creado"})
    }  catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/1   -   GET  se obtiene productos del carrito
cartRouter.get("/api/carts/:cid", async (req, res) =>{
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
cartRouter.post("/api/carts/:cid/product/:pid", async (req, res) =>{
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

export default cartRouter