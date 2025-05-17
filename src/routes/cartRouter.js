import { Router } from "express";
import cartManager from "../../Managers/cartManager.js"
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";

const cart = new cartManager()
const cartRouter = Router()


// http://localhost:8080/api/carts/   - POST  se crea carrito
cartRouter.post("/api/carts", async (req, res) => {
    try {
        await cartModel.create({})
        res.status(201).json({ message: "Carrito creado" })
    } catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/1   -   GET  se obtiene productos del carrito
cartRouter.get("/api/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params
        const carrito = await cartModel.findById(cid).populate('products.product');
        if (!carrito) {
            return res.status(404).json({ error: "carrito no encontrado" })
        } else {
            res.status(200).json({ message: "Carrito encontrado", carrito })
        }
    } catch (error) {
        console.error("Error al encontrar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})


// http://localhost:8080/api/carts/:cid/product/:pid   -  POST  se agrega producto al carrito 
cartRouter.post("/api/carts/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params
        //const productos = await product.mostrarProductos()
        const productoEncontrado = productModel.findById(pid)
        const carrito = await cartModel.findById(cid)
        if (!productoEncontrado || !carrito) {
            return res.status(404).json({ error: "producto o carrito no encontrado" })
        } else {
            const productoEnCarrito = carrito.products.find(p => p.product.toString() === pid);

            if (productoEnCarrito) {
                // Si ya está, aumentamos la cantidad
                productoEnCarrito.quantity += 1;
            } else {
                // Si no está, lo agregamos
                carrito.products.push({ product: pid, quantity: 1 });
            }

            await carrito.save();

            res.status(201).json({ message: "Producto agregado al carrito correctamente" });
        }
    } catch (error) {
        console.error("Error al agregar productos al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/:cid/product/:pid   -  DELETE  se elimina producto del carrito
cartRouter.delete("/api/carts/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params
        const carrito = await cartModel.findById(cid)
        if (!carrito) {
            return res.status(404).json({ error: "carrito no encontrado" })
        } else {

            const productoEnCarrito = carrito.products.find(p => p.product.toString() === pid);
            if (productoEnCarrito) {
                carrito.products = carrito.products.filter(p => p.product.toString() !== pid);
                await carrito.save();
                return res.status(200).json({ message: "Producto eliminado del carrito correctamente"});
            } else {
                return res.status(404).json({ error: "Producto no encontrado en el carrito" });
            }

        }
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/:cid   -  DELETE  se elimina los productos del carrito     
cartRouter.delete("/api/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params
        const carrito = await cartModel.findById(cid)
        if (!carrito) {
            return res.status(404).json({ error: "carrito no encontrado" })
        } else {
            carrito.products = []
            await carrito.save()
            res.status(200).json({ message: "Productos eliminados del carrito correctamente" })
        }
    } catch (error) {
        console.error("Error al eliminar productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/:cid  -  PUT  actualiza todos los productos del carrito con un arreglo de productos.
cartRouter.put("/api/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params
        const { products } = req.body
        const carrito = await cartModel.findById(cid)
        if (!carrito) {
            return res.status(404).json({ error: "carrito no encontrado" })
        } else {
            carrito.products = products
            await carrito.save()
            res.status(200).json({ message: "Productos actualizados del carrito correctamente" })
        }
    } catch (error) {
        console.error("Error al actualizar productos del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// http://localhost:8080/api/carts/:cid/product/:pid   -  PUT  actualiza la cantidad de un producto en el carrito
cartRouter.put("/api/carts/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body
        const carrito = await cartModel.findById(cid)
        if (!carrito) {
            return res.status(404).json({ error: "carrito no encontrado" })
        } else {
            const productoEnCarrito = carrito.products.find(p => p.product.toString() === pid);
            if (productoEnCarrito) {
                productoEnCarrito.quantity = quantity
                await carrito.save()
                res.status(200).json({ message: "Cantidad de producto actualizada correctamente" })
            } else {
                return res.status(404).json({ error: "Producto no encontrado en el carrito" });
            }
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

export default cartRouter