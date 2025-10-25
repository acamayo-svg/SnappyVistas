// js/SistemaIntegracion.js
import { sesionManager } from './SesionManager.js';
import { conexionUsuarios } from './ConexionUsuarios.js';
import { integracionCliente } from './IntegracionCliente.js';
import { integracionEstablecimiento } from './IntegracionEstablecimiento.js';
import { integracionDomiciliario } from './IntegracionDomiciliario.js';
import { TipoUsuario } from '../patrones/UsuarioFabrica.js';

/**
 * Sistema de integración principal que conecta todos los tipos de usuarios
 * con sus respectivas páginas index y funcionalidades
 */
export class SistemaIntegracion {
    constructor() {
        this.integraciones = {
            [TipoUsuario.CLIENTE]: integracionCliente,
            [TipoUsuario.ESTABLECIMIENTO]: integracionEstablecimiento,
            [TipoUsuario.DOMICILIARIO]: integracionDomiciliario
        };
        
        this.initializeSystem();
    }

    /**
     * Inicializa el sistema de integración
     */
    initializeSystem() {
        console.log('=== SISTEMA DE INTEGRACIÓN INICIADO ===');
        console.log('Tipos de usuario disponibles:', Object.keys(this.integraciones));
        
        // Hacer disponible globalmente
        window.sistemaIntegracion = this;
        window.sesionManager = sesionManager;
        window.conexionUsuarios = conexionUsuarios;
    }

    /**
     * Obtiene la integración para un tipo de usuario específico
     * @param {string} tipoUsuario - Tipo de usuario
     * @returns {Object} Integración correspondiente
     */
    obtenerIntegracion(tipoUsuario) {
        const integracion = this.integraciones[tipoUsuario];
        if (!integracion) {
            throw new Error(`Integración no encontrada para tipo: ${tipoUsuario}`);
        }
        return integracion;
    }

    /**
     * Registra un usuario según su tipo
     * @param {Object} datosFormulario - Datos del formulario
     * @returns {Object} Usuario registrado
     */
    async registrarUsuario(datosFormulario) {
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            throw new Error('No se ha seleccionado un tipo de usuario');
        }

        console.log(`=== REGISTRO SISTEMA: ${tipoUsuario} ===`);
        
        const integracion = this.obtenerIntegracion(tipoUsuario);
        
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return await integracion.registrarCliente(datosFormulario);
            case TipoUsuario.ESTABLECIMIENTO:
                return await integracion.registrarEstablecimiento(datosFormulario);
            case TipoUsuario.DOMICILIARIO:
                return await integracion.registrarDomiciliario(datosFormulario);
            default:
                throw new Error(`Tipo de usuario no válido: ${tipoUsuario}`);
        }
    }

    /**
     * Autentica un usuario según su tipo
     * @param {string} correo - Correo del usuario
     * @param {string} contraseña - Contraseña del usuario
     * @returns {Object} Usuario autenticado
     */
    async autenticarUsuario(correo, contraseña) {
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            throw new Error('No se ha seleccionado un tipo de usuario');
        }

        console.log(`=== AUTENTICACIÓN SISTEMA: ${tipoUsuario} ===`);
        
        const integracion = this.obtenerIntegracion(tipoUsuario);
        
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return await integracion.autenticarCliente(correo, contraseña);
            case TipoUsuario.ESTABLECIMIENTO:
                return await integracion.autenticarEstablecimiento(correo, contraseña);
            case TipoUsuario.DOMICILIARIO:
                return await integracion.autenticarDomiciliario(correo, contraseña);
            default:
                throw new Error(`Tipo de usuario no válido: ${tipoUsuario}`);
        }
    }

    /**
     * Obtiene funcionalidades disponibles para el usuario actual
     * @returns {Object} Funcionalidades disponibles
     */
    obtenerFuncionalidadesUsuario() {
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            return { error: 'No hay tipo de usuario seleccionado' };
        }

        const integracion = this.obtenerIntegracion(tipoUsuario);
        return integracion.obtenerFuncionalidades();
    }

    /**
     * Obtiene información completa del usuario actual
     * @returns {Object} Información del usuario
     */
    obtenerInfoUsuario() {
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            return { error: 'No hay tipo de usuario seleccionado' };
        }

        const integracion = this.obtenerIntegracion(tipoUsuario);
        
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return integracion.obtenerInfoCliente();
            case TipoUsuario.ESTABLECIMIENTO:
                return integracion.obtenerInfoEstablecimiento();
            case TipoUsuario.DOMICILIARIO:
                return integracion.obtenerInfoDomiciliario();
            default:
                return { error: 'Tipo de usuario no válido' };
        }
    }

    /**
     * Ejecuta una funcionalidad específica del usuario actual
     * @param {string} funcionalidad - Nombre de la funcionalidad
     * @param {...any} parametros - Parámetros para la funcionalidad
     * @returns {any} Resultado de la funcionalidad
     */
    ejecutarFuncionalidad(funcionalidad, ...parametros) {
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            throw new Error('No hay tipo de usuario seleccionado');
        }

        const integracion = this.obtenerIntegracion(tipoUsuario);
        
        console.log(`=== EJECUTANDO FUNCIONALIDAD: ${funcionalidad} ===`);
        console.log(`Tipo de usuario: ${tipoUsuario}`);
        console.log(`Parámetros:`, parametros);

        // Ejecutar funcionalidad según el tipo de usuario
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return this.ejecutarFuncionalidadCliente(integracion, funcionalidad, parametros);
            case TipoUsuario.ESTABLECIMIENTO:
                return this.ejecutarFuncionalidadEstablecimiento(integracion, funcionalidad, parametros);
            case TipoUsuario.DOMICILIARIO:
                return this.ejecutarFuncionalidadDomiciliario(integracion, funcionalidad, parametros);
            default:
                throw new Error(`Tipo de usuario no válido: ${tipoUsuario}`);
        }
    }

    /**
     * Ejecuta funcionalidades específicas del cliente
     * @param {Object} integracion - Integración del cliente
     * @param {string} funcionalidad - Funcionalidad a ejecutar
     * @param {Array} parametros - Parámetros
     * @returns {any} Resultado
     */
    ejecutarFuncionalidadCliente(integracion, funcionalidad, parametros) {
        switch (funcionalidad) {
            case 'buscarProductos':
                return integracion.buscarProductos(parametros[0]);
            case 'agregarAlCarrito':
                return integracion.agregarAlCarrito(parametros[0], parametros[1]);
            default:
                throw new Error(`Funcionalidad no encontrada: ${funcionalidad}`);
        }
    }

    /**
     * Ejecuta funcionalidades específicas del establecimiento
     * @param {Object} integracion - Integración del establecimiento
     * @param {string} funcionalidad - Funcionalidad a ejecutar
     * @param {Array} parametros - Parámetros
     * @returns {any} Resultado
     */
    ejecutarFuncionalidadEstablecimiento(integracion, funcionalidad, parametros) {
        switch (funcionalidad) {
            case 'recibirPedido':
                return integracion.recibirPedido(parametros[0]);
            case 'aceptarPedido':
                return integracion.aceptarPedido(parametros[0]);
            case 'rechazarPedido':
                return integracion.rechazarPedido(parametros[0], parametros[1]);
            case 'obtenerPedidosDisponibles':
                return integracion.obtenerPedidosDisponibles();
            default:
                throw new Error(`Funcionalidad no encontrada: ${funcionalidad}`);
        }
    }

    /**
     * Ejecuta funcionalidades específicas del domiciliario
     * @param {Object} integracion - Integración del domiciliario
     * @param {string} funcionalidad - Funcionalidad a ejecutar
     * @param {Array} parametros - Parámetros
     * @returns {any} Resultado
     */
    ejecutarFuncionalidadDomiciliario(integracion, funcionalidad, parametros) {
        switch (funcionalidad) {
            case 'obtenerPedidosDisponibles':
                return integracion.obtenerPedidosDisponibles(parametros[0]);
            case 'aceptarPedido':
                return integracion.aceptarPedido(parametros[0]);
            case 'reportarProblema':
                return integracion.reportarProblema(parametros[0], parametros[1], parametros[2]);
            case 'confirmarEntrega':
                return integracion.confirmarEntrega(parametros[0]);
            case 'cambiarDisponibilidad':
                return integracion.cambiarDisponibilidad(parametros[0]);
            default:
                throw new Error(`Funcionalidad no encontrada: ${funcionalidad}`);
        }
    }

    /**
     * Cierra la sesión del usuario actual
     */
    cerrarSesion() {
        console.log('=== CERRANDO SESIÓN SISTEMA ===');
        
        // Cerrar sesión en todos los componentes
        sesionManager.cerrarSesion();
        conexionUsuarios.cerrarSesion();
        
        // Limpiar datos específicos por tipo de usuario
        const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
        if (tipoUsuario) {
            switch (tipoUsuario) {
                case TipoUsuario.CLIENTE:
                    localStorage.removeItem('snappy_carrito_cliente');
                    break;
                case TipoUsuario.ESTABLECIMIENTO:
                    localStorage.removeItem('snappy_notificaciones_establecimiento');
                    break;
                case TipoUsuario.DOMICILIARIO:
                    localStorage.removeItem('snappy_estado_domiciliario');
                    localStorage.removeItem('snappy_reportes_domiciliario');
                    break;
            }
        }
        
        console.log('Sesión cerrada exitosamente');
    }

    /**
     * Obtiene información completa del sistema
     * @returns {Object} Información del sistema
     */
    obtenerInfoSistema() {
        return {
            sistema: {
                nombre: 'Snappy Sistema de Integración',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            },
            sesion: sesionManager.obtenerInfoSesion(),
            conexion: conexionUsuarios.obtenerInfoConexion(),
            usuario: this.obtenerInfoUsuario(),
            funcionalidades: this.obtenerFuncionalidadesUsuario()
        };
    }
}

// Crear instancia global del sistema
export const sistemaIntegracion = new SistemaIntegracion();

// Hacer disponible globalmente
window.sistemaIntegracion = sistemaIntegracion;
