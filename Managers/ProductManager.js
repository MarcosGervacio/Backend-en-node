import  fs  from 'fs/promises';

class productManager{
    constructor(){
        this.file = "products.json"
    }
   
    mostrarProductos = async () => {
        try {
            const data = await fs.readFile(this.file, "utf-8")
            return JSON.parse(data)
        } catch (error) {
            console.log(error);
        }
    }

    crearProducto = async (producto) => {
        let productos = []
        try {
            const data = await fs.readFile(this.file, "utf-8")
            productos = JSON.parse(data)
            const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
            const nuevoProducto = { id: nuevoId, ...producto };
            productos.push(nuevoProducto)
            await fs.writeFile(this.file, JSON.stringify(productos, null, 2))
            console.log("producto registrado")
        } catch (error) {
            console.log(error);
        }
    }

    eliminarProducto = async (id) => {
        try {
            const data = await fs.readFile(this.file, "utf-8");
            let productos = JSON.parse(data);
    
            const productosFiltrados = productos.filter(prod => prod.id !== Number(id));
    
            if (productos.length === productosFiltrados.length) {
                console.log("Producto no encontrado");
            } else {
                await fs.writeFile(this.file, JSON.stringify(productosFiltrados, null, 2));
                console.log(`Producto con ID ${id} eliminado correctamente`);
            }
    
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    };

    actualizarProducto = async (id, productoActualizado) => {
        try {
            const data = await fs.readFile(this.file, "utf-8");
            let productos = JSON.parse(data);
    
            const index = productos.findIndex(prod => prod.id === Number(id));

            if (index === -1) {
                console.log("Producto no encontrado");
            }else{
                productos[index] = { ...productos[index], ...productoActualizado };
                await fs.writeFile(this.file, JSON.stringify(productos, null, 2));
            }
    
        } catch (error) {
            console.error("Error al actualizar producto:", error);
        }
    }

}

export default productManager