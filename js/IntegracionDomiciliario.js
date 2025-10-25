// js/IntegracionDomiciliario.js
import { conexionUsuarios } from './ConexionUsuarios.js';
import { TipoUsuario } from '../patrones/UsuarioFabrica.js';

/**
 * Integración específica para usuarios Domiciliario
 * Maneja la conexión entre el modelo Domiciliario y las páginas index
 */
export class IntegracionDomiciliario {
    constructor() {
        this.tipoUsuario = TipoUsuario.DOMICILIARIO;
        this.paginas = {
            index: 'Vistas/Domiciliario/indexDomiciliario.html',
            seleccion: 'Vistas/Domiciliario/seleccionDomiciliario.html',
            registro: 'Vistas/Domiciliario/registroDomiciliario.html',
            inicio: 'Vistas/Domiciliario/inicioDomiciliario.html',
            dashboard: 'Vistas/Domiciliario/dashboardDomiciliario.html',
            pedidosDisponibles: 'Vistas/Domiciliario/pedidosDisponibles.html'
        };
    }

    /**
     * Registra un nuevo domiciliario
     * @param {Object} datosFormulario - Datos del formulario de registro
     * @returns {Object} Domiciliario creado
     */
    async registrarDomiciliario(datosFormulario) {
        console.log('=== REGISTRO DOMICILIARIO: Iniciando proceso ===');
        
        try {
            // Validar datos específicos del domiciliario
            this.validarDatosDomiciliario(datosFormulario);
            
            // Registrar usando ConexionUsuarios
            const domiciliario = await conexionUsuarios.registrarUsuario(datosFormulario);
            
            console.log(`Domiciliario registrado: ${domiciliario.obtenerNombre()}`);
            console.log(`Vehículo: ${domiciliario.obtenerTipoVehiculo()}`);
            console.log(`Placa: ${domiciliario.obtenerPlaca()}`);
            console.log(`Zona: ${domiciliario.obtenerZonaCobertura()}`);
            console.log(`Estado: ${domiciliario.estaDisponible() ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
            
            return domiciliario;
            
        } catch (error) {
            console.error('Error en registro de domiciliario:', error.message);
            throw error;
        }
    }

    /**
     * Autentica un domiciliario existente
     * @param {string} correo - Correo del domiciliario
     * @param {string} contraseña - Contraseña del domiciliario
     * @returns {Object} Domiciliario autenticado
     */
    async autenticarDomiciliario(correo, contraseña) {
        console.log('=== AUTENTICACIÓN DOMICILIARIO: Iniciando proceso ===');
        
        try {
            const domiciliario = await conexionUsuarios.autenticarUsuario(correo, contraseña);
            
            console.log(`Domiciliario autenticado: ${domiciliario.obtenerNombre()}`);
            console.log(`Estado: ${domiciliario.estaDisponible() ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
            console.log(`Pedido actual: ${domiciliario.obtenerPedidoActual() || 'Ninguno'}`);
            
            return domiciliario;
            
        } catch (error) {
            console.error('Error en autenticación de domiciliario:', error.message);
            throw error;
        }
    }

    /**
     * Valida datos específicos del domiciliario
     * @param {Object} datos - Datos a validar
     */
    validarDatosDomiciliario(datos) {
        if (!datos.nombre || datos.nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
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
        
        if (!datos.placa || datos.placa.trim().length < 6) {
            throw new Error('La placa del vehículo debe tener al menos 6 caracteres');
        }
        
        // Validar tipo de vehículo
        const tiposVehiculosValidos = ['Motocicleta', 'Bicicleta', 'Carro', 'A pie'];
        if (datos.tipoVehiculo && !tiposVehiculosValidos.includes(datos.tipoVehiculo)) {
            throw new Error(`Tipo de vehículo inválido. Válidos: ${tiposVehiculosValidos.join(', ')}`);
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
     * Obtiene funcionalidades específicas del domiciliario
     * @returns {Object} Funcionalidades disponibles
     */
    obtenerFuncionalidades() {
        return {
            visualizarPedidos: 'Ver pedidos disponibles',
            aceptarPedidos: 'Aceptar pedidos para entrega',
            reportarProblemas: 'Reportar problemas de entrega',
            confirmarEntrega: 'Confirmar entrega exitosa',
            cambiarDisponibilidad: 'Cambiar estado de disponibilidad',
            actualizarVehiculo: 'Actualizar información del vehículo',
            actualizarZona: 'Actualizar zona de cobertura'
        };
    }

    /**
     * Obtiene pedidos disponibles para el domiciliario
     * @param {string} zonaCobertura - Zona de cobertura del domiciliario
     * @returns {Array} Lista de pedidos disponibles
     */
    obtenerPedidosDisponibles(zonaCobertura = 'Centro') {
        console.log(`Domiciliario visualiza pedidos en zona: ${zonaCobertura}`);
        
        // Simular pedidos disponibles
        const pedidos = [
            {
                id: 'PED-001',
                establecimiento: 'Pizzería El Buen Sabor',
                cliente: 'Juan Pérez',
                direccion: 'Carrera 5 #12-34',
                distancia: '2.5 km',
                tiempoEstimado: '15 minutos',
                pago: 35000,
                zona: zonaCobertura
            },
            {
                id: 'PED-002',
                establecimiento: 'Burger King',
                cliente: 'María García',
                direccion: 'Calle 8 #45-67',
                distancia: '1.8 km',
                tiempoEstimado: '12 minutos',
                pago: 28000,
                zona: zonaCobertura
            },
            {
                id: 'PED-003',
                establecimiento: 'Cruz Verde',
                cliente: 'Carlos López',
                direccion: 'Avenida 3 #78-90',
                distancia: '3.2 km',
                tiempoEstimado: '20 minutos',
                pago: 15000,
                zona: zonaCobertura
            }
        ];
        
        console.log(`Pedidos disponibles: ${pedidos.length}`);
        return pedidos;
    }

    /**
     * Simula aceptar un pedido
     * @param {string} idPedido - ID del pedido
     * @returns {boolean} True si se aceptó exitosamente
     */
    aceptarPedido(idPedido) {
        console.log(`Domiciliario ACEPTÓ pedido: ${idPedido}`);
        console.log(`Estado cambiado a: NO DISPONIBLE`);
        console.log(`Iniciando ruta de entrega...`);
        
        // Simular cambio de estado
        const estadoDomiciliario = {
            disponible: false,
            pedidoActual: idPedido,
            timestamp: Date.now()
        };
        localStorage.setItem('snappy_estado_domiciliario', JSON.stringify(estadoDomiciliario));
        
        return true;
    }

    /**
     * Simula reportar un problema
     * @param {string} idPedido - ID del pedido
     * @param {string} tipoProblema - Tipo de problema
     * @param {string} descripcion - Descripción del problema
     * @returns {boolean} True si se reportó exitosamente
     */
    reportarProblema(idPedido, tipoProblema, descripcion) {
        console.log(`REPORTE DE PROBLEMA:`);
        console.log(`Pedido: ${idPedido}`);
        console.log(`Tipo: ${tipoProblema}`);
        console.log(`Descripción: ${descripcion}`);
        console.log(`Estado del pedido cambiado a: ENTREGA FALLIDA`);
        
        // Simular reporte
        const reporte = {
            idPedido,
            tipoProblema,
            descripcion,
            timestamp: Date.now()
        };
        
        const reportes = JSON.parse(localStorage.getItem('snappy_reportes_domiciliario') || '[]');
        reportes.push(reporte);
        localStorage.setItem('snappy_reportes_domiciliario', JSON.stringify(reportes));
        
        return true;
    }

    /**
     * Simula confirmar entrega
     * @param {string} idPedido - ID del pedido
     * @returns {boolean} True si se confirmó exitosamente
     */
    confirmarEntrega(idPedido) {
        console.log(`ENTREGA CONFIRMADA:`);
        console.log(`Pedido: ${idPedido} entregado exitosamente`);
        console.log(`Domiciliario ahora está DISPONIBLE`);
        
        // Simular liberación del domiciliario
        const estadoDomiciliario = {
            disponible: true,
            pedidoActual: null,
            timestamp: Date.now()
        };
        localStorage.setItem('snappy_estado_domiciliario', JSON.stringify(estadoDomiciliario));
        
        return true;
    }

    /**
     * Cambia el estado de disponibilidad del domiciliario
     * @param {boolean} disponible - Nuevo estado de disponibilidad
     * @returns {boolean} True si se cambió exitosamente
     */
    cambiarDisponibilidad(disponible) {
        const estado = disponible ? "DISPONIBLE" : "NO DISPONIBLE";
        console.log(`Domiciliario cambió estado a: ${estado}`);
        
        // Simular cambio de estado
        const estadoDomiciliario = {
            disponible,
            pedidoActual: disponible ? null : 'PEDIDO_ACTIVO',
            timestamp: Date.now()
        };
        localStorage.setItem('snappy_estado_domiciliario', JSON.stringify(estadoDomiciliario));
        
        return true;
    }

    /**
     * Obtiene el estado actual del domiciliario
     * @returns {Object} Estado del domiciliario
     */
    obtenerEstadoDomiciliario() {
        const estado = JSON.parse(localStorage.getItem('snappy_estado_domiciliario') || '{}');
        return {
            disponible: estado.disponible || true,
            pedidoActual: estado.pedidoActual || null,
            timestamp: estado.timestamp || Date.now()
        };
    }

    /**
     * Obtiene información del domiciliario actual
     * @returns {Object} Información del domiciliario
     */
    obtenerInfoDomiciliario() {
        const sesion = conexionUsuarios.obtenerInfoConexion();
        const estado = this.obtenerEstadoDomiciliario();
        
        return {
            tipo: this.tipoUsuario,
            paginas: this.paginas,
            funcionalidades: this.obtenerFuncionalidades(),
            sesion: sesion,
            estado: estado,
            pedidosDisponibles: this.obtenerPedidosDisponibles(),
            reportes: JSON.parse(localStorage.getItem('snappy_reportes_domiciliario') || '[]')
        };
    }
}

// Crear instancia global
export const integracionDomiciliario = new IntegracionDomiciliario();

// Hacer disponible globalmente
window.integracionDomiciliario = integracionDomiciliario;
