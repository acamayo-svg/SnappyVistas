// js/SesionManager.js
import { UsuarioFabrica, TipoUsuario } from '../patrones/UsuarioFabrica.js';

/**
 * Gestor de sesión que maneja la comunicación entre la página principal
 * y el modelo UsuarioFabrica para identificar el tipo de usuario seleccionado
 */
export class SesionManager {
    constructor() {
        this.tipoUsuarioSeleccionado = null;
        this.usuarioActual = null;
        this.initializeStorage();
    }

    /**
     * Inicializa el localStorage con valores por defecto
     */
    initializeStorage() {
        if (!localStorage.getItem('snappy_tipo_usuario')) {
            localStorage.setItem('snappy_tipo_usuario', '');
        }
        if (!localStorage.getItem('snappy_usuario_actual')) {
            localStorage.setItem('snappy_usuario_actual', '');
        }
    }

    /**
     * Establece el tipo de usuario seleccionado desde la página principal
     * @param {string} tipoUsuario - Tipo de usuario (CLIENTE, ESTABLECIMIENTO, DOMICILIARIO)
     */
    seleccionarTipoUsuario(tipoUsuario) {
        console.log(`=== SESIÓN: Seleccionando tipo de usuario: ${tipoUsuario} ===`);
        
        // Validar que el tipo de usuario sea válido
        if (!UsuarioFabrica.esTipoUsuarioValido(tipoUsuario)) {
            throw new Error(`Tipo de usuario no válido: ${tipoUsuario}`);
        }

        // Guardar en localStorage
        this.tipoUsuarioSeleccionado = tipoUsuario;
        localStorage.setItem('snappy_tipo_usuario', tipoUsuario);
        
        console.log(`Tipo de usuario guardado: ${tipoUsuario}`);
        return true;
    }

    /**
     * Obtiene el tipo de usuario actualmente seleccionado
     * @returns {string|null} Tipo de usuario seleccionado
     */
    obtenerTipoUsuarioSeleccionado() {
        const tipo = localStorage.getItem('snappy_tipo_usuario');
        this.tipoUsuarioSeleccionado = tipo || null;
        return this.tipoUsuarioSeleccionado;
    }

    /**
     * Crea una instancia de usuario usando UsuarioFabrica
     * @param {Object} datos - Datos del usuario
     * @returns {Object} Instancia del usuario creado
     */
    crearUsuario(datos) {
        const tipoUsuario = this.obtenerTipoUsuarioSeleccionado();
        
        if (!tipoUsuario) {
            throw new Error('No se ha seleccionado un tipo de usuario');
        }

        console.log(`=== SESIÓN: Creando usuario tipo ${tipoUsuario} ===`);
        
        try {
            // Usar UsuarioFabrica para crear la instancia
            const usuario = UsuarioFabrica.crearUsuario(tipoUsuario, datos);
            
            // Guardar usuario actual
            this.usuarioActual = usuario;
            localStorage.setItem('snappy_usuario_actual', JSON.stringify({
                tipo: tipoUsuario,
                datos: {
                    id: usuario.obtenerID(),
                    nombre: usuario.obtenerNombre(),
                    correo: usuario.obtenerCorreo(),
                    telefono: usuario.obtenerTelefono()
                }
            }));

            console.log(`Usuario creado exitosamente: ${usuario.obtenerNombre()}`);
            return usuario;
            
        } catch (error) {
            console.error('Error al crear usuario:', error.message);
            throw error;
        }
    }

    /**
     * Obtiene el usuario actual de la sesión
     * @returns {Object|null} Usuario actual o null si no hay sesión
     */
    obtenerUsuarioActual() {
        const usuarioData = localStorage.getItem('snappy_usuario_actual');
        if (usuarioData) {
            return JSON.parse(usuarioData);
        }
        return null;
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean} True si hay sesión activa
     */
    haySesionActiva() {
        return this.obtenerUsuarioActual() !== null;
    }

    /**
     * Cierra la sesión actual
     */
    cerrarSesion() {
        console.log('=== SESIÓN: Cerrando sesión ===');
        
        if (this.usuarioActual && this.usuarioActual.cerrarSesion) {
            this.usuarioActual.cerrarSesion();
        }

        // Limpiar datos
        this.usuarioActual = null;
        this.tipoUsuarioSeleccionado = null;
        
        // Limpiar localStorage
        localStorage.removeItem('snappy_tipo_usuario');
        localStorage.removeItem('snappy_usuario_actual');
        
        console.log('Sesión cerrada exitosamente');
    }

    /**
     * Redirige a la página correspondiente según el tipo de usuario
     * @param {string} tipoUsuario - Tipo de usuario
     */
    redirigirSegunTipoUsuario(tipoUsuario) {
        console.log(`=== SESIÓN: Redirigiendo según tipo: ${tipoUsuario} ===`);
        
        // Guardar el tipo de usuario seleccionado
        this.seleccionarTipoUsuario(tipoUsuario);
        
        // Redirigir a la página correspondiente
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                window.location.href = 'Cliente/indexCliente.html';
                break;
            case TipoUsuario.ESTABLECIMIENTO:
                window.location.href = 'Establecimiento/indexEstablecimiento.html';
                break;
            case TipoUsuario.DOMICILIARIO:
                window.location.href = 'Domiciliario/indexDomiciliario.html';
                break;
            default:
                throw new Error(`Tipo de usuario no válido para redirección: ${tipoUsuario}`);
        }
    }

    /**
     * Obtiene información de la sesión actual para debugging
     * @returns {Object} Información de la sesión
     */
    obtenerInfoSesion() {
        return {
            tipoUsuarioSeleccionado: this.obtenerTipoUsuarioSeleccionado(),
            usuarioActual: this.obtenerUsuarioActual(),
            haySesionActiva: this.haySesionActiva(),
            timestamp: new Date().toISOString()
        };
    }
}

// Crear instancia global del gestor de sesión
export const sesionManager = new SesionManager();

// Hacer disponible globalmente para uso en las páginas HTML
window.sesionManager = sesionManager;
