// js/IntegracionCliente.js
import { conexionUsuarios } from './ConexionUsuarios.js';
import { TipoUsuario } from '../patrones/UsuarioFabrica.js';

/**
 * Integración específica para usuarios Cliente
 * Maneja la conexión entre el modelo Cliente y las páginas index
 */
export class IntegracionCliente {
    constructor() {
        this.tipoUsuario = TipoUsuario.CLIENTE;
        this.paginas = {
            index: 'Vistas/Cliente/indexCliente.html',
            seleccion: 'Vistas/Cliente/seleccionCliente.html',
            registro: 'Vistas/Cliente/registroCliente.html',
            inicio: 'Vistas/Cliente/inicioCliente.html',
            dashboard: 'Vistas/Cliente/dashboardCliente.html'
        };
    }

    /**
     * Registra un nuevo cliente
     * @param {Object} datosFormulario - Datos del formulario de registro
     * @returns {Object} Cliente creado
     */
    async registrarCliente(datosFormulario) {
        console.log('=== REGISTRO CLIENTE: Iniciando proceso ===');
        
        try {
            // Validar datos específicos del cliente
            this.validarDatosCliente(datosFormulario);
            
            // Registrar usando ConexionUsuarios
            const cliente = await conexionUsuarios.registrarUsuario(datosFormulario);
            
            console.log(`Cliente registrado: ${cliente.obtenerNombre()}`);
            console.log(`Dirección: ${cliente.obtenerDireccion()}`);
            
            return cliente;
            
        } catch (error) {
            console.error('Error en registro de cliente:', error.message);
            throw error;
        }
    }

    /**
     * Autentica un cliente existente
     * @param {string} correo - Correo del cliente
     * @param {string} contraseña - Contraseña del cliente
     * @returns {Object} Cliente autenticado
     */
    async autenticarCliente(correo, contraseña) {
        console.log('=== AUTENTICACIÓN CLIENTE: Iniciando proceso ===');
        
        try {
            const cliente = await conexionUsuarios.autenticarUsuario(correo, contraseña);
            
            console.log(`Cliente autenticado: ${cliente.obtenerNombre()}`);
            console.log(`Historial de pedidos: ${cliente.obtenerHistorialPedidos().length} pedidos`);
            
            return cliente;
            
        } catch (error) {
            console.error('Error en autenticación de cliente:', error.message);
            throw error;
        }
    }

    /**
     * Valida datos específicos del cliente
     * @param {Object} datos - Datos a validar
     */
    validarDatosCliente(datos) {
        if (!datos.direccion || datos.direccion.trim().length < 10) {
            throw new Error('La dirección debe tener al menos 10 caracteres');
        }
        
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
     * Obtiene funcionalidades específicas del cliente
     * @returns {Object} Funcionalidades disponibles
     */
    obtenerFuncionalidades() {
        return {
            buscarProductos: 'Buscar productos y servicios',
            agregarCarrito: 'Agregar productos al carrito',
            realizarPedido: 'Realizar pedidos',
            calificar: 'Calificar establecimientos',
            verHistorial: 'Ver historial de pedidos',
            actualizarDireccion: 'Actualizar dirección de entrega'
        };
    }

    /**
     * Simula búsqueda de productos
     * @param {string} termino - Término de búsqueda
     * @returns {Array} Productos encontrados
     */
    buscarProductos(termino) {
        console.log(`Cliente buscando: ${termino}`);
        
        // Simular productos disponibles
        const productos = [
            { id: 'PROD-001', nombre: 'Pizza Margherita', precio: 25000, establecimiento: 'Pizzería El Buen Sabor' },
            { id: 'PROD-002', nombre: 'Hamburguesa Clásica', precio: 18000, establecimiento: 'Burger King' },
            { id: 'PROD-003', nombre: 'Café Americano', precio: 3500, establecimiento: 'Juan Valdez' },
            { id: 'PROD-004', nombre: 'Medicamento X', precio: 15000, establecimiento: 'Cruz Verde' }
        ];
        
        const resultados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(termino.toLowerCase())
        );
        
        console.log(`Encontrados ${resultados.length} productos`);
        return resultados;
    }

    /**
     * Simula agregar producto al carrito
     * @param {string} productoId - ID del producto
     * @param {number} cantidad - Cantidad a agregar
     * @returns {boolean} True si se agregó exitosamente
     */
    agregarAlCarrito(productoId, cantidad = 1) {
        console.log(`Agregando producto ${productoId} (cantidad: ${cantidad}) al carrito`);
        
        // Simular carrito en localStorage
        let carrito = JSON.parse(localStorage.getItem('snappy_carrito_cliente') || '[]');
        
        const itemExistente = carrito.find(item => item.productoId === productoId);
        
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            carrito.push({ productoId, cantidad, timestamp: Date.now() });
        }
        
        localStorage.setItem('snappy_carrito_cliente', JSON.stringify(carrito));
        
        console.log(`Carrito actualizado: ${carrito.length} productos`);
        return true;
    }

    /**
     * Obtiene información del cliente actual
     * @returns {Object} Información del cliente
     */
    obtenerInfoCliente() {
        const sesion = conexionUsuarios.obtenerInfoConexion();
        return {
            tipo: this.tipoUsuario,
            paginas: this.paginas,
            funcionalidades: this.obtenerFuncionalidades(),
            sesion: sesion,
            carrito: JSON.parse(localStorage.getItem('snappy_carrito_cliente') || '[]')
        };
    }
}

// Crear instancia global
export const integracionCliente = new IntegracionCliente();

// Hacer disponible globalmente
window.integracionCliente = integracionCliente;
