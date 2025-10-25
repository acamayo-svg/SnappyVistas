// patrones/UsuarioFabrica.js
import { Usuario } from '../modelos/Usuario.js';
import { Cliente } from '../modelos/Cliente.js';
import { Establecimiento } from '../modelos/Establecimiento.js';
import { Domiciliario } from '../modelos/Domiciliario.js';

// Enum-like object para los tipos de usuario
export const TipoUsuario = {
    CLIENTE: 'CLIENTE',
    ESTABLECIMIENTO: 'ESTABLECIMIENTO', 
    DOMICILIARIO: 'DOMICILIARIO'
};

// Factory abstracto principal
export class UsuarioFabrica {
    
    // Método Factory principal (Factory Method)
    static crearUsuario(tipo, datos) {
        console.log(`=== FACTORY: Creando usuario tipo ${tipo} ===`);
        
        // Validaciones generales
        this.validarDatosBasicos(datos);
        
        switch (tipo) {
            case TipoUsuario.CLIENTE:
                return this.crearCliente(datos);
                
            case TipoUsuario.ESTABLECIMIENTO:
                return this.crearEstablecimiento(datos);
                
            case TipoUsuario.DOMICILIARIO:
                return this.crearDomiciliario(datos);
                
            default:
                throw new Error(`Tipo de usuario no válido: ${tipo}`);
        }
    }

    // Factory Methods específicos para cada tipo de usuario
    static crearCliente(datos) {
        console.log(`Creando Cliente: ${datos.nombre}`);
        
        // Validaciones específicas del cliente
        if (!datos.direccion || datos.direccion.trim().length < 10) {
            throw new Error('La dirección del cliente debe tener al menos 10 caracteres');
        }

        const cliente = new Cliente(
            datos.id,
            datos.nombre,
            datos.correo,
            datos.telefono,
            datos.contraseña,
            datos.direccion.trim()
        );

        console.log(`Cliente creado exitosamente - ID: ${datos.id}`);
        return cliente;
    }

    static crearEstablecimiento(datos) {
        console.log(`Creando Establecimiento: ${datos.nombre}`);
        
        // Validaciones específicas del establecimiento
        if (!datos.tipoPersona) {
            datos.tipoPersona = 'Jurídica'; // Valor por defecto
        }
        
        if (!datos.horarioAtencion) {
            datos.horarioAtencion = '8:00-22:00'; // Valor por defecto
        }
        
        if (!datos.zonaCobertura) {
            datos.zonaCobertura = 'Centro'; // Valor por defecto
        }
        
        if (!datos.tipoCocina) {
            datos.tipoCocina = 'General'; // Valor por defecto
        }

        // Validar formato de horario (básico)
        if (!this.validarFormatoHorario(datos.horarioAtencion)) {
            throw new Error('Formato de horario inválido. Use formato: HH:MM-HH:MM');
        }

        const establecimiento = new Establecimiento(
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

        console.log(`Establecimiento creado exitosamente - ID: ${datos.id}`);
        return establecimiento;
    }

    static crearDomiciliario(datos) {
        console.log(`Creando Domiciliario: ${datos.nombre}`);
        
        // Validaciones específicas del domiciliario
        if (!datos.tipoVehiculo) {
            datos.tipoVehiculo = 'Motocicleta'; // Valor por defecto
        }
        
        if (!datos.placa || datos.placa.trim().length < 6) {
            throw new Error('La placa del vehículo debe tener al menos 6 caracteres');
        }
        
        if (!datos.zonaCobertura) {
            datos.zonaCobertura = 'Centro'; // Valor por defecto
        }

        // Validar tipo de vehículo
        const tiposVehiculosValidos = ['Motocicleta', 'Bicicleta', 'Carro', 'A pie'];
        if (!tiposVehiculosValidos.includes(datos.tipoVehiculo)) {
            throw new Error(`Tipo de vehículo inválido. Válidos: ${tiposVehiculosValidos.join(', ')}`);
        }

        const domiciliario = new Domiciliario(
            datos.id,
            datos.nombre,
            datos.correo,
            datos.telefono,
            datos.contraseña,
            datos.tipoVehiculo,
            datos.placa.trim().toUpperCase(),
            datos.zonaCobertura
        );

        console.log(`Domiciliario creado exitosamente - ID: ${datos.id}`);
        return domiciliario;
    }

    // Validaciones comunes para todos los usuarios
    static validarDatosBasicos(datos) {
        if (!datos.id || datos.id.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
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

    // Validación de formato de email
    static validarEmail(email) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
    }

    // Validación de formato de horario (HH:MM-HH:MM)
    static validarFormatoHorario(horario) {
        const regexHorario = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regexHorario.test(horario);
    }

    // Método de utilidad para generar ID único
    static generarId(tipoUsuario) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        
        switch (tipoUsuario) {
            case TipoUsuario.CLIENTE:
                return `CLI-${timestamp}-${random}`;
            case TipoUsuario.ESTABLECIMIENTO:
                return `EST-${timestamp}-${random}`;
            case TipoUsuario.DOMICILIARIO:
                return `DOM-${timestamp}-${random}`;
            default:
                return `USR-${timestamp}-${random}`;
        }
    }

    // Método para crear usuarios con datos de ejemplo
    static crearUsuarioEjemplo(tipo) {
        console.log(`Creando usuario de ejemplo tipo: ${tipo}`);
        
        const id = this.generarId(tipo);
        
        switch (tipo) {
            case TipoUsuario.CLIENTE:
                const datosClienteEjemplo = {
                    id: id,
                    nombre: 'Juan Pérez Cliente',
                    correo: 'juan.cliente@email.com',
                    telefono: '3001234567',
                    contraseña: 'cliente123',
                    direccion: 'Carrera 5 #12-34, Apartamento 201'
                };
                return this.crearCliente(datosClienteEjemplo);

            case TipoUsuario.ESTABLECIMIENTO:
                const datosEstablecimientoEjemplo = {
                    id: id,
                    nombre: 'Restaurante El Buen Sabor',
                    correo: 'contacto@buensabor.com',
                    telefono: '3009876543',
                    contraseña: 'restaurant123',
                    tipoPersona: 'Jurídica',
                    horarioAtencion: '10:00-23:00',
                    zonaCobertura: 'Centro y Norte',
                    tipoCocina: 'Comida Internacional'
                };
                return this.crearEstablecimiento(datosEstablecimientoEjemplo);

            case TipoUsuario.DOMICILIARIO:
                const datosDomiciliarioEjemplo = {
                    id: id,
                    nombre: 'Carlos Rodríguez Delivery',
                    correo: 'carlos.delivery@email.com',
                    telefono: '3005555555',
                    contraseña: 'delivery123',
                    tipoVehiculo: 'Motocicleta',
                    placa: 'ABC123',
                    zonaCobertura: 'Sur y Centro'
                };
                return this.crearDomiciliario(datosDomiciliarioEjemplo);

            default:
                throw new Error(`Tipo de usuario no válido para ejemplo: ${tipo}`);
        }
    }

    // Método para obtener tipos de usuario disponibles
    static obtenerTiposUsuario() {
        return Object.values(TipoUsuario);
    }

    // Método para validar si un tipo de usuario es válido
    static esTipoUsuarioValido(tipo) {
        return Object.values(TipoUsuario).includes(tipo);
    }
}