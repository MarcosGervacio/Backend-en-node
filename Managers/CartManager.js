import  fs  from 'fs/promises';
import productManager from "./productManager.js"

const product = new productManager()

class cartManager{
    constructor(){
        this.file = "cart.json"
    }

    crearCarrito = async () => {
        let carritos = []
        try {
            const data = await fs.readFile(this.file, "utf-8")
            carritos = JSON.parse(data)
            const nuevoId = carritos.length + 1
            const nuevoCarrito = { id: nuevoId, products: []};
            carritos.push(nuevoCarrito)
            await fs.writeFile(this.file, JSON.stringify(carritos, null, 2))
            console.log("carrito registrado")
        } catch (error) {
            console.log(error);
        }        
    }

    obtenerCarrito = async (id) => {
        try {
            const data = await fs.readFile(this.file, "utf-8")
            let carritos = JSON.parse(data)
            const carritoEncontrado = carritos.find(cart => cart.id === Number(id));
            if(!carritoEncontrado){
                console.log("Carrito no encontrado");
            }else{
                return carritoEncontrado.products
            }
        } catch (error) {
            console.log(error);
        }   
    }

    agregarProductos = async (cid, pid) => {
        try {
            const data = await fs.readFile(this.file, "utf-8")
            let carritos = JSON.parse(data)
            const carritoEncontrado = carritos.find(cart => cart.id === Number(cid));
            if (!carritoEncontrado) {
                return { error: `Carrito con ID ${cid} no encontrado`};
            }
            const productos = await product.mostrarProductos()
            const productoEncontrado = productos.find(prod => prod.id === Number(pid))
            if (!productoEncontrado) {
                return { error: `Producto con ID ${pid} no encontrado`};
            }

            const productoEnCarrito = carritoEncontrado.products.find(p => p.product === Number(pid));

            if (productoEnCarrito) {
                productoEnCarrito.quantity += 1;
            } else {
                carritoEncontrado.products.push({ product: Number(pid), quantity: 1 });
            }
            
            await fs.writeFile(this.file, JSON.stringify(carritos, null, 2));
        } catch (error) {
            console.log(error);
        } 
    }

    
}

export default cartManager