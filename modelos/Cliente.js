// modelos/Cliente.js
import { Usuario } from './Usuario.js';

export class Cliente extends Usuario {
    constructor(id, nombre, correo, telefono, contraseña, direccion) {
        super(id, nombre, correo, telefono, contraseña);
        this.direccion = direccion;
        this.historialPedidos = [];
    }

    buscarProducto(termino) {
        console.log(`Cliente ${this.nombre} está buscando: ${termino}`);
        // Aquí se integraría con el BuscadorProductos
    }

    agregarCarrito(productoId, cantidad) {
        console.log(`Cliente ${this.nombre} agregó producto ${productoId} (cantidad: ${cantidad}) al carrito`);
        // Aquí se integraría con el CarritoCompras
    }

    realizarPedido() {
        const idPedido = `PED-${Date.now()}`;
        this.historialPedidos.push(idPedido);
        console.log(`Cliente ${this.nombre} realizó pedido: ${idPedido}`);
        return idPedido;
    }

    calificar(establecimientoId, puntuacion, comentario) {
        if (puntuacion < 1 || puntuacion > 5) {
            console.log('Error: La puntuación debe estar entre 1 y 5');
            return;
        }
        
        console.log(`Cliente ${this.nombre} calificó establecimiento ${establecimientoId} con ${puntuacion} estrellas`);
        if (comentario) {
            console.log(`Comentario: ${comentario}`);
        }
    }

    // Getters específicos del Cliente
    obtenerDireccion() {
        return this.direccion;
    }

    obtenerHistorialPedidos() {
        return [...this.historialPedidos]; // Retorna copia para evitar modificaciones
    }

    actualizarDireccion(nuevaDireccion) {
        this.direccion = nuevaDireccion;
        console.log(`Dirección actualizada a: ${nuevaDireccion}`);
    }
}