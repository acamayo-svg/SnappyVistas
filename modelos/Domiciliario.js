// modelos/Domiciliario.js
import { Usuario } from './Usuario.js';

export class Domiciliario extends Usuario {
    constructor(id, nombre, correo, telefono, contraseña, tipoVehiculo, placa, zonaCobertura) {
        super(id, nombre, correo, telefono, contraseña);
        this.tipoVehiculo = tipoVehiculo;
        this.placa = placa;
        this.zonaCobertura = zonaCobertura;
        this.disponible = true;
        this.pedidoActual = null;
    }

    visualizarPedidos() {
        // Simula obtener pedidos disponibles en su zona
        const pedidosDisponibles = [
            `PED-001-${this.zonaCobertura}`,
            `PED-002-${this.zonaCobertura}`,
            `PED-003-${this.zonaCobertura}`
        ];

        console.log(`Domiciliario ${this.nombre} visualiza pedidos en zona: ${this.zonaCobertura}`);
        console.log(`Pedidos disponibles:`, pedidosDisponibles);
        
        return pedidosDisponibles;
    }

    aceptarPedido(idPedido) {
        if (!this.disponible) {
            console.log(`Domiciliario ${this.nombre} no está disponible. Pedido actual: ${this.pedidoActual}`);
            return false;
        }

        this.disponible = false;
        this.pedidoActual = idPedido;
        console.log(`Domiciliario ${this.nombre} ACEPTÓ pedido: ${idPedido}`);
        console.log(`Estado cambiado a: NO DISPONIBLE`);
        return true;
    }

    reportarProblema(idPedido, tipoProblema, descripcion) {
        console.log(`REPORTE DE PROBLEMA:`);
        console.log(`Domiciliario: ${this.nombre}`);
        console.log(`Pedido: ${idPedido}`);
        console.log(`Tipo: ${tipoProblema}`);
        console.log(`Descripción: ${descripcion}`);
        
        // Cambiar estado del pedido a "entrega fallida"
        console.log(`Estado del pedido ${idPedido} cambiado a: ENTREGA FALLIDA`);
    }

    confirmarEntrega(idPedido) {
        if (this.pedidoActual !== idPedido) {
            console.log(`Error: El pedido ${idPedido} no corresponde al pedido actual`);
            return;
        }

        console.log(`ENTREGA CONFIRMADA:`);
        console.log(`Domiciliario: ${this.nombre}`);
        console.log(`Pedido: ${idPedido} entregado exitosamente`);
        
        // Liberar domiciliario
        this.disponible = true;
        this.pedidoActual = null;
        console.log(`Domiciliario ${this.nombre} ahora está DISPONIBLE`);
    }

    cambiarEstadoDisponibilidad(disponible) {
        this.disponible = disponible;
        const estado = disponible ? "DISPONIBLE" : "NO DISPONIBLE";
        console.log(`Domiciliario ${this.nombre} cambió estado a: ${estado}`);
    }

    // Getters específicos del Domiciliario
    obtenerTipoVehiculo() {
        return this.tipoVehiculo;
    }

    obtenerPlaca() {
        return this.placa;
    }

    obtenerZonaCobertura() {
        return this.zonaCobertura;
    }

    estaDisponible() {
        return this.disponible;
    }

    obtenerPedidoActual() {
        return this.pedidoActual;
    }

    // Métodos para actualizar información del domiciliario
    actualizarVehiculo(tipoVehiculo, placa) {
        this.tipoVehiculo = tipoVehiculo;
        this.placa = placa;
        console.log(`Vehículo actualizado: ${tipoVehiculo} - Placa: ${placa}`);
    }

    actualizarZonaCobertura(nuevaZona) {
        this.zonaCobertura = nuevaZona;
        console.log(`Zona de cobertura actualizada: ${nuevaZona}`);
    }
}