// modelos/Establecimiento.js
import { Usuario } from './Usuario.js';

export class Establecimiento extends Usuario {
    constructor(id, nombre, correo, telefono, contraseña, tipoPersona, horarioAtencion, zonaCobertura, tipoCocina) {
        super(id, nombre, correo, telefono, contraseña);
        this.tipoPersona = tipoPersona;
        this.horarioAtencion = horarioAtencion;
        this.zonaCobertura = zonaCobertura;
        this.tipoCocina = tipoCocina;
        this.pedidosRecibidos = [];
    }

    recibirPedido(idPedido) {
        this.pedidosRecibidos.push(idPedido);
        console.log(`Establecimiento ${this.nombre} recibió nuevo pedido: ${idPedido}`);
        this.notificarNuevoPedido(idPedido);
    }

    aceptarPedido(idPedido) {
        const pedidoExiste = this.pedidosRecibidos.includes(idPedido);
        
        if (!pedidoExiste) {
            console.log(`Error: Pedido ${idPedido} no encontrado`);
            return false;
        }

        console.log(`Establecimiento ${this.nombre} ACEPTÓ pedido: ${idPedido}`);
        console.log(`Iniciando preparación del pedido...`);
        return true;
    }

    rechazarPedido(idPedido, motivo) {
        const pedidoExiste = this.pedidosRecibidos.includes(idPedido);
        
        if (!pedidoExiste) {
            console.log(`Error: Pedido ${idPedido} no encontrado`);
            return false;
        }

        console.log(`Establecimiento ${this.nombre} RECHAZÓ pedido: ${idPedido}`);
        console.log(`Motivo: ${motivo}`);
        
        // Remover pedido de la lista
        this.pedidosRecibidos = this.pedidosRecibidos.filter(p => p !== idPedido);
        return true;
    }

    prepararPedido(idPedido) {
        console.log(`Establecimiento ${this.nombre} está preparando pedido: ${idPedido}`);
        console.log(`Tiempo estimado: 15-30 minutos`);
    }

    notificarNuevoPedido(idPedido) {
        console.log(`🔔 NOTIFICACIÓN: Nuevo pedido ${idPedido} para ${this.nombre}`);
    }

    // Getters específicos del Establecimiento
    obtenerTipoPersona() {
        return this.tipoPersona;
    }

    obtenerHorarioAtencion() {
        return this.horarioAtencion;
    }

    obtenerZonaCobertura() {
        return this.zonaCobertura;
    }

    obtenerTipoCocina() {
        return this.tipoCocina;
    }

    obtenerPedidosRecibidos() {
        return [...this.pedidosRecibidos];
    }

    // Métodos para actualizar información del establecimiento
    actualizarHorario(nuevoHorario) {
        this.horarioAtencion = nuevoHorario;
        console.log(`Horario de atención actualizado: ${nuevoHorario}`);
    }

    actualizarZonaCobertura(nuevaZona) {
        this.zonaCobertura = nuevaZona;
        console.log(`Zona de cobertura actualizada: ${nuevaZona}`);
    }
}