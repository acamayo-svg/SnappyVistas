// modelos/Producto.js

export class Producto {
    constructor(id, nombre, descripcion, precio, categoria, establecimientoId, disponible = true, imagenUrl) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.establecimientoId = establecimientoId;
        this.disponible = disponible;
        this.imagenUrl = imagenUrl;
    }

    obtenerDetalles() {
        return `
    PRODUCTO: ${this.nombre}
    Precio: $${this.precio.toLocaleString()}
    Descripción: ${this.descripcion}
    Categoría: ${this.categoria}
    Establecimiento: ${this.establecimientoId}
    ${this.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
        `.trim();
    }

    actualizarDisponibilidad(disponible) {
        this.disponible = disponible;
        const estado = disponible ? 'DISPONIBLE' : 'NO DISPONIBLE';
        console.log(`Producto ${this.nombre} ahora está: ${estado}`);
    }

    actualizarPrecio(nuevoPrecio) {
        if (nuevoPrecio <= 0) {
            console.log('Error: El precio debe ser mayor a 0');
            return;
        }
        
        const precioAnterior = this.precio;
        this.precio = nuevoPrecio;
        console.log(`Precio de ${this.nombre} actualizado: $${precioAnterior.toLocaleString()} → $${nuevoPrecio.toLocaleString()}`);
    }

    aplicarDescuento(porcentajeDescuento) {
        if (porcentajeDescuento <= 0 || porcentajeDescuento > 100) {
            console.log('Error: El descuento debe estar entre 1% y 100%');
            return this.precio;
        }

        const descuento = (this.precio * porcentajeDescuento) / 100;
        const precioConDescuento = this.precio - descuento;
        
        console.log(`Descuento aplicado a ${this.nombre}:`);
        console.log(`Precio original: $${this.precio.toLocaleString()}`);
        console.log(`Descuento (${porcentajeDescuento}%): -$${descuento.toLocaleString()}`);
        console.log(`Precio final: $${precioConDescuento.toLocaleString()}`);
        
        return precioConDescuento;
    }

    estaDisponible() {
        return this.disponible;
    }

    perteneceACategoria(categoria) {
        return this.categoria.toLowerCase() === categoria.toLowerCase();
    }

    // Getters públicos
    obtenerID() {
        return this.id;
    }

    obtenerNombre() {
        return this.nombre;
    }

    obtenerDescripcion() {
        return this.descripcion;
    }

    obtenerPrecio() {
        return this.precio;
    }

    obtenerCategoria() {
        return this.categoria;
    }

    obtenerEstablecimientoId() {
        return this.establecimientoId;
    }

    obtenerImagenUrl() {
        return this.imagenUrl;
    }

}