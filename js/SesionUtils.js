// js/SesionUtils.js
/**
 * Utilidades para el manejo de sesión en las páginas HTML
 * Proporciona funciones de conveniencia para acceder a la información de sesión
 */

/**
 * Obtiene el tipo de usuario actualmente seleccionado
 * @returns {string|null} Tipo de usuario o null si no hay selección
 */
export function obtenerTipoUsuarioSeleccionado() {
    return localStorage.getItem('snappy_tipo_usuario') || null;
}

/**
 * Obtiene los datos del usuario actual
 * @returns {Object|null} Datos del usuario o null si no hay sesión
 */
export function obtenerUsuarioActual() {
    const usuarioData = localStorage.getItem('snappy_usuario_actual');
    return usuarioData ? JSON.parse(usuarioData) : null;
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} True si hay sesión activa
 */
export function haySesionActiva() {
    return obtenerUsuarioActual() !== null;
}

/**
 * Obtiene información completa de la sesión
 * @returns {Object} Información de la sesión
 */
export function obtenerInfoSesion() {
    return {
        tipoUsuarioSeleccionado: obtenerTipoUsuarioSeleccionado(),
        usuarioActual: obtenerUsuarioActual(),
        haySesionActiva: haySesionActiva(),
        timestamp: new Date().toISOString()
    };
}

/**
 * Limpia toda la información de sesión
 */
export function limpiarSesion() {
    localStorage.removeItem('snappy_tipo_usuario');
    localStorage.removeItem('snappy_usuario_actual');
    console.log('Sesión limpiada');
}

/**
 * Muestra información de sesión en la consola (para debugging)
 */
export function mostrarInfoSesion() {
    const info = obtenerInfoSesion();
    console.log('=== INFORMACIÓN DE SESIÓN ===');
    console.log('Tipo de usuario seleccionado:', info.tipoUsuarioSeleccionado);
    console.log('Usuario actual:', info.usuarioActual);
    console.log('Hay sesión activa:', info.haySesionActiva);
    console.log('Timestamp:', info.timestamp);
    return info;
}

/**
 * Valida que el tipo de usuario sea válido
 * @param {string} tipo - Tipo de usuario a validar
 * @returns {boolean} True si es válido
 */
export function esTipoUsuarioValido(tipo) {
    const tiposValidos = ['CLIENTE', 'ESTABLECIMIENTO', 'DOMICILIARIO'];
    return tiposValidos.includes(tipo);
}

/**
 * Obtiene la URL de redirección según el tipo de usuario
 * @param {string} tipoUsuario - Tipo de usuario
 * @returns {string} URL de redirección
 */
export function obtenerUrlRedireccion(tipoUsuario) {
    switch (tipoUsuario) {
        case 'CLIENTE':
            return 'Vistas/Cliente/IndexCliente.html';
        case 'ESTABLECIMIENTO':
            return 'Vistas/Establecimiento/indexEstablecimiento.html';
        case 'DOMICILIARIO':
            return 'Vistas/Domiciliario/indexDomiciliario.html';
        default:
            throw new Error(`Tipo de usuario no válido: ${tipoUsuario}`);
    }
}

/**
 * Redirige a la página principal
 */
export function volverAPrincipal() {
    window.location.href = '../indexPrincipal.html';
}

/**
 * Redirige según el tipo de usuario actual
 */
export function redirigirSegunTipoActual() {
    const tipoUsuario = obtenerTipoUsuarioSeleccionado();
    if (tipoUsuario) {
        const url = obtenerUrlRedireccion(tipoUsuario);
        window.location.href = url;
    } else {
        console.warn('No hay tipo de usuario seleccionado');
        volverAPrincipal();
    }
}

// Hacer funciones disponibles globalmente
window.obtenerTipoUsuarioSeleccionado = obtenerTipoUsuarioSeleccionado;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.haySesionActiva = haySesionActiva;
window.obtenerInfoSesion = obtenerInfoSesion;
window.limpiarSesion = limpiarSesion;
window.mostrarInfoSesion = mostrarInfoSesion;
window.esTipoUsuarioValido = esTipoUsuarioValido;
window.obtenerUrlRedireccion = obtenerUrlRedireccion;
window.volverAPrincipal = volverAPrincipal;
window.redirigirSegunTipoActual = redirigirSegunTipoActual;
