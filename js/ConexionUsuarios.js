// js/ConexionUsuarios.js
import { sesionManager } from './SesionManager.js';
import { UsuarioFabrica, TipoUsuario } from '../patrones/UsuarioFabrica.js';
import { Cliente } from '../modelos/Cliente.js';
import { Establecimiento } from '../modelos/Establecimiento.js';
import { Domiciliario } from '../modelos/Domiciliario.js';

/**
 * Sistema de conexión entre modelos de usuario y páginas index
 * Maneja la creación, autenticación y navegación de usuarios
 */
export class ConexionUsuarios {
    constructor() {
        this.usuariosRegistrados = new Map(); // Simula base de datos
        this.sesionesActivas = new Map();
        this.initializeStorage();
    }

    /**
     * Inicializa el almacenamiento local
     */
    initializeStorage() {
        if (!localStorage.getItem('snappy_usuarios_registrados')) {
            localStorage.setItem('snappy_usuarios_registrados', JSON.stringify({}));
        }
        if (!localStorage.getItem('snappy_sesiones_activas')) {
            localStorage.setItem('snappy_sesiones_activas', JSON.stringify({}));
        }
    }

    /**
     * Registra un nuevo usuario según el tipo seleccionado
     * @param {Object} datosFormulario - Datos del formulario de registro
     * @returns {Object} Usuario creado
     */
    async registrarUsuario(datosFormulario) {
        console.log('=== REGISTRO: Iniciando proceso de registro ===');
        
        try {
            // 1. Obtener tipo de usuario seleccionado
            const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
            
            if (!tipoUsuario) {
                throw new Error('No se ha seleccionado un tipo de usuario. Vuelve a la página principal.');
            }

            console.log(`Registrando usuario tipo: ${tipoUsuario}`);

            // 2. Preparar datos específicos según el tipo
            const datosCompletos = this.prepararDatosUsuario(tipoUsuario, datosFormulario);

            // 3. Crear usuario usando UsuarioFabrica
            const usuario = UsuarioFabrica.crearUsuario(tipoUsuario, datosCompletos);

            // 4. Guardar usuario en "base de datos" simulada
            this.guardarUsuario(usuario);

            // 5. Establecer sesión activa
            this.establecerSesionActiva(usuario);

            // 6. Redirigir al dashboard correspondiente
            this.redirigirAlDashboard(tipoUsuario);

            console.log(`Usuario ${tipoUsuario} registrado exitosamente: ${usuario.obtenerNombre()}`);
            return usuario;

        } catch (error) {
            console.error('Error en registro:', error.message);
            throw error;
        }
    }

    /**
     * Autentica un usuario existente
     * @param {string} correo - Correo del usuario
     * @param {string} contraseña - Contraseña del usuario
     * @returns {Object|null} Usuario autenticado o null
     */
    async autenticarUsuario(correo, contraseña) {
        console.log('=== AUTENTICACIÓN: Iniciando proceso de login ===');
        
        try {
            const tipoUsuario = sesionManager.obtenerTipoUsuarioSeleccionado();
            
            if (!tipoUsuario) {
                throw new Error('No se ha seleccionado un tipo de usuario');
            }

            // Buscar usuario en la "base de datos" simulada
            const usuario = this.buscarUsuarioPorCorreo(correo, tipoUsuario);
            
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar credenciales
            if (!usuario.iniciarSesion(correo, contraseña)) {
                throw new Error('Credenciales incorrectas');
            }

            // Establecer sesión activa
            this.establecerSesionActiva(usuario);

            // Redirigir al dashboard correspondiente
            this.redirigirAlDashboard(tipoUsuario);

            console.log(`Usuario autenticado exitosamente: ${usuario.obtenerNombre()}`);
            return usuario;

        } catch (error) {
            console.error('Error en autenticación:', error.message);
            throw error;
        }
    }

    /**
     * Prepara datos específicos según el tipo de usuario
     * @param {string} tipoUsuario - Tipo de usuario
     * @param {Object} datosFormulario - Datos del formulario
     * @returns {Object} Datos completos del usuario
     */
    prepararDatosUsuario(tipoUsuario, datosFormulario) {
        const datosBase = {
            id: UsuarioFabrica.generarId(tipoUsuario),
            nombre: datosFormulario.nombre,
            correo: datosFormulario.correo,
            telefono: datosFormulario.telefono,
            contraseña: datosFormulario.contraseña
        };

        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return {
                    ...datosBase,
                    direccion: datosFormulario.direccion || 'Dirección no especificada'
                };

            case TipoUsuario.ESTABLECIMIENTO:
                return {
                    ...datosBase,
                    tipoPersona: datosFormulario.tipoPersona || 'Jurídica',
                    horarioAtencion: datosFormulario.horarioAtencion || '8:00-22:00',
                    zonaCobertura: datosFormulario.zonaCobertura || 'Centro',
                    tipoCocina: datosFormulario.tipoCocina || 'General'
                };

            case TipoUsuario.DOMICILIARIO:
                return {
                    ...datosBase,
                    tipoVehiculo: datosFormulario.tipoVehiculo || 'Motocicleta',
                    placa: datosFormulario.placa || 'SINPLACA',
                    zonaCobertura: datosFormulario.zonaCobertura || 'Centro'
                };

            default:
                return datosBase;
        }
    }

    /**
     * Guarda un usuario en la "base de datos" simulada
     * @param {Object} usuario - Usuario a guardar
     */
    guardarUsuario(usuario) {
        const usuarios = JSON.parse(localStorage.getItem('snappy_usuarios_registrados'));
        usuarios[usuario.obtenerID()] = {
            tipo: this.obtenerTipoUsuario(usuario),
            datos: {
                id: usuario.obtenerID(),
                nombre: usuario.obtenerNombre(),
                correo: usuario.obtenerCorreo(),
                telefono: usuario.obtenerTelefono(),
                // Datos específicos según el tipo
                ...this.obtenerDatosEspecificos(usuario)
            }
        };
        localStorage.setItem('snappy_usuarios_registrados', JSON.stringify(usuarios));
    }

    /**
     * Busca un usuario por correo y tipo
     * @param {string} correo - Correo del usuario
     * @param {string} tipoUsuario - Tipo de usuario
     * @returns {Object|null} Usuario encontrado o null
     */
    buscarUsuarioPorCorreo(correo, tipoUsuario) {
        const usuarios = JSON.parse(localStorage.getItem('snappy_usuarios_registrados'));
        
        for (const [id, usuarioData] of Object.entries(usuarios)) {
            if (usuarioData.datos.correo === correo && usuarioData.tipo === tipoUsuario) {
                // Recrear instancia del usuario
                return this.recrearUsuario(usuarioData);
            }
        }
        
        return null;
    }

    /**
     * Recrea una instancia de usuario desde datos almacenados
     * @param {Object} usuarioData - Datos del usuario
     * @returns {Object} Instancia del usuario
     */
    recrearUsuario(usuarioData) {
        const datos = usuarioData.datos;
        
        switch (usuarioData.tipo) {
            case TipoUsuario.CLIENTE:
                return new Cliente(
                    datos.id,
                    datos.nombre,
                    datos.correo,
                    datos.telefono,
                    datos.contraseña,
                    datos.direccion
                );

            case TipoUsuario.ESTABLECIMIENTO:
                return new Establecimiento(
                    datos.id,
                    datos.nombre,
                    datos.correo,
                    datos.telefono,
                    datos.contraseña,
                    datos.tipoPersona,
                    datos.horarioAtencion,
                    datos.zonaCobertura,
                    datos.tipoCocina
                );

            case TipoUsuario.DOMICILIARIO:
                return new Domiciliario(
                    datos.id,
                    datos.nombre,
                    datos.correo,
                    datos.telefono,
                    datos.contraseña,
                    datos.tipoVehiculo,
                    datos.placa,
                    datos.zonaCobertura
                );

            default:
                throw new Error(`Tipo de usuario no válido: ${usuarioData.tipo}`);
        }
    }

    /**
     * Establece una sesión activa
     * @param {Object} usuario - Usuario de la sesión
     */
    establecerSesionActiva(usuario) {
        const sesiones = JSON.parse(localStorage.getItem('snappy_sesiones_activas'));
        sesiones[usuario.obtenerID()] = {
            usuario: {
                id: usuario.obtenerID(),
                nombre: usuario.obtenerNombre(),
                correo: usuario.obtenerCorreo(),
                telefono: usuario.obtenerTelefono()
            },
            timestamp: Date.now(),
            activa: true
        };
        localStorage.setItem('snappy_sesiones_activas', JSON.stringify(sesiones));
    }

    /**
     * Redirige al dashboard correspondiente
     * @param {string} tipoUsuario - Tipo de usuario
     */
    redirigirAlDashboard(tipoUsuario) {
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                window.location.href = 'Vistas/Cliente/dashboardCliente.html';
                break;
            case TipoUsuario.ESTABLECIMIENTO:
                window.location.href = 'Vistas/Establecimiento/dashboardEstablecimiento.html';
                break;
            case TipoUsuario.DOMICILIARIO:
                window.location.href = 'Vistas/Domiciliario/dashboardDomiciliario.html';
                break;
            default:
                throw new Error(`Tipo de usuario no válido para redirección: ${tipoUsuario}`);
        }
    }

    /**
     * Obtiene el tipo de usuario de una instancia
     * @param {Object} usuario - Instancia del usuario
     * @returns {string} Tipo de usuario
     */
    obtenerTipoUsuario(usuario) {
        if (usuario instanceof Cliente) return TipoUsuario.CLIENTE;
        if (usuario instanceof Establecimiento) return TipoUsuario.ESTABLECIMIENTO;
        if (usuario instanceof Domiciliario) return TipoUsuario.DOMICILIARIO;
        throw new Error('Tipo de usuario no reconocido');
    }

    /**
     * Obtiene datos específicos de un usuario
     * @param {Object} usuario - Instancia del usuario
     * @returns {Object} Datos específicos
     */
    obtenerDatosEspecificos(usuario) {
        if (usuario instanceof Cliente) {
            return { direccion: usuario.obtenerDireccion() };
        }
        if (usuario instanceof Establecimiento) {
            return {
                tipoPersona: usuario.obtenerTipoPersona(),
                horarioAtencion: usuario.obtenerHorarioAtencion(),
                zonaCobertura: usuario.obtenerZonaCobertura(),
                tipoCocina: usuario.obtenerTipoCocina()
            };
        }
        if (usuario instanceof Domiciliario) {
            return {
                tipoVehiculo: usuario.obtenerTipoVehiculo(),
                placa: usuario.obtenerPlaca(),
                zonaCobertura: usuario.obtenerZonaCobertura()
            };
        }
        return {};
    }

    /**
     * Cierra la sesión actual
     */
    cerrarSesion() {
        console.log('=== CERRANDO SESIÓN ===');
        
        // Limpiar sesión en SesionManager
        sesionManager.cerrarSesion();
        
        // Limpiar sesiones activas
        localStorage.removeItem('snappy_sesiones_activas');
        
        console.log('Sesión cerrada exitosamente');
    }

    /**
     * Obtiene información de la conexión actual
     * @returns {Object} Información de la conexión
     */
    obtenerInfoConexion() {
        return {
            sesionManager: sesionManager.obtenerInfoSesion(),
            usuariosRegistrados: Object.keys(JSON.parse(localStorage.getItem('snappy_usuarios_registrados'))).length,
            sesionesActivas: Object.keys(JSON.parse(localStorage.getItem('snappy_sesiones_activas'))).length,
            timestamp: new Date().toISOString()
        };
    }
}

// Crear instancia global
export const conexionUsuarios = new ConexionUsuarios();

// Hacer disponible globalmente
window.conexionUsuarios = conexionUsuarios;
