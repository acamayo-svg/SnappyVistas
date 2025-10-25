// patrones/CarritoCompras.js
// Implementación compatible con navegador (sin módulos ES) y Singleton
// Expone CarritoCompras en window cuando está disponible

(function(global) {

class CarritoCompras {
    constructor() {
        if (CarritoCompras.instancia) {
            console.log('Usando instancia existente del carrito');
            return CarritoCompras.instancia;
        }
        
        this.productos = [];
        this.total = 0;
        CarritoCompras.instancia = this;
        console.log('Nueva instancia de CarritoCompras creada');
        console.log('Carrito de compras inicializado (Singleton)');
    }

    // Método estático para obtener la única instancia (Singleton)
    static obtenerInstancia() {
        if (!CarritoCompras.instancia) {
            CarritoCompras.instancia = new CarritoCompras();
        }
        return CarritoCompras.instancia;
    }

    // Utilidades internas para soportar objetos planos o instancias de Producto
    static obtenerId(producto) {
        return typeof producto?.obtenerID === 'function' ? producto.obtenerID() : producto?.id;
    }

    static obtenerNombre(producto) {
        return typeof producto?.obtenerNombre === 'function' ? producto.obtenerNombre() : producto?.nombre;
    }

    static obtenerPrecio(producto) {
        return typeof producto?.obtenerPrecio === 'function' ? producto.obtenerPrecio() : Number(producto?.precio || 0);
    }

    static estaDisponible(producto) {
        if (typeof producto?.estaDisponible === 'function') return producto.estaDisponible();
        if (typeof producto?.disponible !== 'undefined') return !!producto.disponible;
        return true; // por defecto disponible si no hay información
    }

    agregarProducto(producto, cantidad) {
        if (cantidad <= 0) {
            console.log('Error: La cantidad debe ser mayor a 0');
            return;
        }

        if (!CarritoCompras.estaDisponible(producto)) {
            console.log(`Error: El producto ${CarritoCompras.obtenerNombre(producto)} no está disponible`);
            return;
        }

        // Verificar si el producto ya existe en el carrito
        const productoExistente = this.productos.find(
            item => CarritoCompras.obtenerId(item.producto) === CarritoCompras.obtenerId(producto)
        );

        if (productoExistente) {
            // Si existe, actualizar cantidad y subtotal
            productoExistente.cantidad += cantidad;
            productoExistente.subtotal = CarritoCompras.obtenerPrecio(productoExistente.producto) * productoExistente.cantidad;
            
            console.log(`Producto ${CarritoCompras.obtenerNombre(producto)} actualizado en el carrito`);
            console.log(`Nueva cantidad: ${productoExistente.cantidad}`);
        } else {
            // Si no existe, crear nuevo item
            const nuevoItem = {
                producto: producto,
                cantidad: cantidad,
                subtotal: CarritoCompras.obtenerPrecio(producto) * cantidad
            };
            this.productos.push(nuevoItem);
            
            console.log(`Producto ${CarritoCompras.obtenerNombre(producto)} agregado al carrito`);
            console.log(`Cantidad: ${cantidad}`);
        }

        this.calcularTotal();
        this.mostrarResumenCarrito();
    }

    eliminarProducto(idProducto) {
        const productoIndex = this.productos.findIndex(
            item => CarritoCompras.obtenerId(item.producto) === idProducto
        );

        if (productoIndex === -1) {
            console.log(`Error: Producto con ID ${idProducto} no encontrado en el carrito`);
            return;
        }

        const productoEliminado = this.productos[productoIndex];
        this.productos.splice(productoIndex, 1);
        
        console.log(`Producto ${productoEliminado.producto.obtenerNombre()} eliminado del carrito`);
        
        this.calcularTotal();
        this.mostrarResumenCarrito();
    }

    actualizarCantidad(idProducto, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            console.log('Error: La cantidad debe ser mayor a 0');
            return;
        }

        const item = this.productos.find(
            item => CarritoCompras.obtenerId(item.producto) === idProducto
        );

        if (!item) {
            console.log(`Error: Producto con ID ${idProducto} no encontrado en el carrito`);
            return;
        }

        const cantidadAnterior = item.cantidad;
        item.cantidad = nuevaCantidad;
        item.subtotal = CarritoCompras.obtenerPrecio(item.producto) * nuevaCantidad;

        console.log(`Cantidad de ${CarritoCompras.obtenerNombre(item.producto)} actualizada: ${cantidadAnterior} → ${nuevaCantidad}`);
        
        this.calcularTotal();
        this.mostrarResumenCarrito();
    }

    calcularTotal() {
        this.total = this.productos.reduce((suma, item) => suma + item.subtotal, 0);
        return this.total;
    }

    obtenerProductos() {
        // Retorna una copia para evitar modificaciones externas
        return this.productos.map(item => ({
            producto: item.producto,
            cantidad: item.cantidad,
            subtotal: item.subtotal
        }));
    }

    obtenerTotal() {
        return this.total;
    }

    obtenerCantidadTotal() {
        return this.productos.reduce((suma, item) => suma + item.cantidad, 0);
    }

    vaciarCarrito() {
        const cantidadProductos = this.productos.length;
        this.productos = [];
        this.total = 0;
        
        console.log(`Carrito vaciado - ${cantidadProductos} productos eliminados`);
    }

    estaVacio() {
        return this.productos.length === 0;
    }

    mostrarResumenCarrito() {
        console.log('\n=== RESUMEN DEL CARRITO ===');
        
        if (this.estaVacio()) {
            console.log('El carrito está vacío');
            return;
        }

        this.productos.forEach((item, index) => {
            console.log(`${index + 1}. ${CarritoCompras.obtenerNombre(item.producto)}`);
            console.log(`   Precio unitario: $${CarritoCompras.obtenerPrecio(item.producto).toLocaleString()}`);
            console.log(`   Cantidad: ${item.cantidad}`);
            console.log(`   Subtotal: $${item.subtotal.toLocaleString()}`);
            console.log('');
        });

        console.log(`TOTAL: ${this.total.toLocaleString()}`);
        console.log(`Productos totales: ${this.obtenerCantidadTotal()}`);
        console.log('================================\n');
    }

    aplicarCupon(codigoCupon, porcentajeDescuento) {
        if (this.estaVacio()) {
            console.log('Error: No se puede aplicar cupón a un carrito vacío');
            return this.total;
        }

        if (porcentajeDescuento <= 0 || porcentajeDescuento > 100) {
            console.log('Error: El descuento debe estar entre 1% y 100%');
            return this.total;
        }

        const descuento = (this.total * porcentajeDescuento) / 100;
        const totalConDescuento = this.total - descuento;

        console.log(`Cupón ${codigoCupon} aplicado:`);
        console.log(`Subtotal: ${this.total.toLocaleString()}`);
        console.log(`Descuento (${porcentajeDescuento}%): -${descuento.toLocaleString()}`);
        console.log(`TOTAL CON DESCUENTO: ${totalConDescuento.toLocaleString()}`);

        return totalConDescuento;
    }

    // Método para preparar datos para checkout
    prepararCheckout() {
        if (this.estaVacio()) {
            throw new Error('No se puede proceder al checkout con un carrito vacío');
        }

        return {
            productos: this.obtenerProductos(),
            cantidadTotal: this.obtenerCantidadTotal(),
            total: this.obtenerTotal(),
            fechaCreacion: new Date().toISOString()
        };
    }
}

// Exportación compatible: Node/CommonJS, ES Modules, o navegador (window)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { CarritoCompras };
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return CarritoCompras; });
} else {
    global.CarritoCompras = CarritoCompras;
}

})(typeof window !== 'undefined' ? window : globalThis);