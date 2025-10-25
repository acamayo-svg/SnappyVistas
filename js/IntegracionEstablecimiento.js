// js/IntegracionEstablecimiento.js
import { conexionUsuarios } from './ConexionUsuarios.js';
import { TipoUsuario } from '../patrones/UsuarioFabrica.js';

/**
 * Integración específica para usuarios Establecimiento
 * Maneja la conexión entre el modelo Establecimiento y las páginas index
 */
export class IntegracionEstablecimiento {
    constructor() {
        this.tipoUsuario = TipoUsuario.ESTABLECIMIENTO;
        this.paginas = {
            index: 'Vistas/Establecimiento/indexEstablecimiento.html',
            seleccion: 'Vistas/Establecimiento/seleccionEstablecimiento.html',
            registro: 'Vistas/Establecimiento/registroEstablecimiento.html',
            inicio: 'Vistas/Establecimiento/inicioEstablecimiento.html',
            dashboard: 'Vistas/Establecimiento/dashboardEstablecimiento.html'
        };
    }

    /**
     * Registra un nuevo establecimiento
     * @param {Object} datosFormulario - Datos del formulario de registro
     * @returns {Object} Establecimiento creado
     */
    async registrarEstablecimiento(datosFormulario) {
        console.log('=== REGISTRO ESTABLECIMIENTO: Iniciando proceso ===');
        
        try {
            // Validar datos específicos del establecimiento
            this.validarDatosEstablecimiento(datosFormulario);
            
            // Registrar usando ConexionUsuarios
            const establecimiento = await conexionUsuarios.registrarUsuario(datosFormulario);
            
            console.log(`Establecimiento registrado: ${establecimiento.obtenerNombre()}`);
            console.log(`Tipo: ${establecimiento.obtenerTipoPersona()}`);
            console.log(`Horario: ${establecimiento.obtenerHorarioAtencion()}`);
            console.log(`Zona: ${establecimiento.obtenerZonaCobertura()}`);
            console.log(`Cocina: ${establecimiento.obtenerTipoCocina()}`);
            
            return establecimiento;
            
        } catch (error) {
            console.error('Error en registro de establecimiento:', error.message);
            throw error;
        }
    }

    /**
     * Autentica un establecimiento existente
     * @param {string} correo - Correo del establecimiento
     * @param {string} contraseña - Contraseña del establecimiento
     * @returns {Object} Establecimiento autenticado
     */
    async autenticarEstablecimiento(correo, contraseña) {
        console.log('=== AUTENTICACIÓN ESTABLECIMIENTO: Iniciando proceso ===');
        
        try {
            const establecimiento = await conexionUsuarios.autenticarUsuario(correo, contraseña);
            
            console.log(`Establecimiento autenticado: ${establecimiento.obtenerNombre()}`);
            console.log(`Pedidos recibidos: ${establecimiento.obtenerPedidosRecibidos().length} pedidos`);
            
            return establecimiento;
            
        } catch (error) {
            console.error('Error en autenticación de establecimiento:', error.message);
            throw error;
        }
    }

    /**
     * Valida datos específicos del establecimiento
     * @param {Object} datos - Datos a validar
     */
    validarDatosEstablecimiento(datos) {
        if (!datos.nombre || datos.nombre.trim().length < 2) {
            throw new Error('El nombre del establecimiento debe tener al menos 2 caracteres');
        }
        
        if (!datos.correo || !this.validarEmail(datos.correo)) {
            throw new Error('El email no tiene un formato válido');
        }
        
        if (!datos.telefono || datos.telefono.trim().length < 10) {
            throw new Error('El teléfono debe tener al menos 10 dígitos');
        }
        
        if (!datos.contraseña || datos.contraseña.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        if (datos.horarioAtencion && !this.validarFormatoHorario(datos.horarioAtencion)) {
            throw new Error('Formato de horario inválido. Use formato: HH:MM-HH:MM');
        }
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    validarEmail(email) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
    }

    /**
     * Valida formato de horario (HH:MM-HH:MM)
     * @param {string} horario - Horario a validar
     * @returns {boolean} True si es válido
     */
    validarFormatoHorario(horario) {
        const regexHorario = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regexHorario.test(horario);
    }

    /**
     * Obtiene funcionalidades específicas del establecimiento
     * @returns {Object} Funcionalidades disponibles
     */
    obtenerFuncionalidades() {
        return {
            recibirPedidos: 'Recibir nuevos pedidos',
            aceptarPedidos: 'Aceptar pedidos',
            rechazarPedidos: 'Rechazar pedidos',
            prepararPedidos: 'Preparar pedidos',
            actualizarHorario: 'Actualizar horario de atención',
            actualizarZona: 'Actualizar zona de cobertura',
            verPedidos: 'Ver pedidos recibidos'
        };
    }

    /**
     * Simula recibir un nuevo pedido
     * @param {string} idPedido - ID del pedido
     * @returns {boolean} True si se recibió exitosamente
     */
    recibirPedido(idPedido) {
        console.log(`Establecimiento recibió nuevo pedido: ${idPedido}`);
        
        // Simular notificación
        this.notificarNuevoPedido(idPedido);
        
        return true;
    }

    /**
     * Simula notificación de nuevo pedido
     * @param {string} idPedido - ID del pedido
     */
    notificarNuevoPedido(idPedido) {
        console.log(`🔔 NOTIFICACIÓN: Nuevo pedido ${idPedido} recibido`);
        console.log(`Tiempo de respuesta recomendado: 5 minutos`);
        
        // Simular notificación en localStorage
        const notificaciones = JSON.parse(localStorage.getItem('snappy_notificaciones_establecimiento') || '[]');
        notificaciones.push({
            id: idPedido,
            tipo: 'nuevo_pedido',
            timestamp: Date.now(),
            leida: false
        });
        localStorage.setItem('snappy_notificaciones_establecimiento', JSON.stringify(notificaciones));
    }

    /**
     * Simula aceptar un pedido
     * @param {string} idPedido - ID del pedido
     * @returns {boolean} True si se aceptó exitosamente
     */
    aceptarPedido(idPedido) {
        console.log(`Establecimiento ACEPTÓ pedido: ${idPedido}`);
        console.log(`Iniciando preparación del pedido...`);
        console.log(`Tiempo estimado: 15-30 minutos`);
        
        return true;
    }

    /**
     * Simula rechazar un pedido
     * @param {string} idPedido - ID del pedido
     * @param {string} motivo - Motivo del rechazo
     * @returns {boolean} True si se rechazó exitosamente
     */
    rechazarPedido(idPedido, motivo) {
        console.log(`Establecimiento RECHAZÓ pedido: ${idPedido}`);
        console.log(`Motivo: ${motivo}`);
        
        return true;
    }

    /**
     * Obtiene pedidos disponibles para el establecimiento
     * @returns {Array} Lista de pedidos
     */
    obtenerPedidosDisponibles() {
        // Simular pedidos disponibles
        const pedidos = [
            {
                id: 'PED-001',
                cliente: 'Juan Pérez',
                productos: ['Pizza Margherita', 'Coca-Cola'],
                total: 35000,
                direccion: 'Carrera 5 #12-34',
                tiempoEstimado: '25 minutos'
            },
            {
                id: 'PED-002',
                cliente: 'María García',
                productos: ['Hamburguesa Clásica', 'Papas Fritas'],
                total: 28000,
                direccion: 'Calle 8 #45-67',
                tiempoEstimado: '20 minutos'
            }
        ];
        
        console.log(`Pedidos disponibles: ${pedidos.length}`);
        return pedidos;
    }

    /**
     * Obtiene información del establecimiento actual
     * @returns {Object} Información del establecimiento
     */
    obtenerInfoEstablecimiento() {
        const sesion = conexionUsuarios.obtenerInfoConexion();
        return {
            tipo: this.tipoUsuario,
            paginas: this.paginas,
            funcionalidades: this.obtenerFuncionalidades(),
            sesion: sesion,
            pedidos: this.obtenerPedidosDisponibles(),
            notificaciones: JSON.parse(localStorage.getItem('snappy_notificaciones_establecimiento') || '[]')
        };
    }
}

// Crear instancia global
export const integracionEstablecimiento = new IntegracionEstablecimiento();

// Hacer disponible globalmente
window.integracionEstablecimiento = integracionEstablecimiento;
