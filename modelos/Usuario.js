// modelos/Usuario.js
export class Usuario {
    constructor(id, nombre, correo, telefono, contraseña) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.contraseña = contraseña;
    }

    iniciarSesion(correo, contraseña) {
        return this.correo === correo && this.contraseña === contraseña;
    }

    cerrarSesion() {
        console.log(`Usuario ${this.nombre} ha cerrado sesión`);
    }

    actualizarPerfil(nombre, telefono) {
        if (nombre) {
            this.nombre = nombre;
            console.log(`Nombre actualizado a: ${nombre}`);
        }
        if (telefono) {
            this.telefono = telefono;
            console.log(`Teléfono actualizado a: ${telefono}`);
        }
    }

    // Getters públicos
    obtenerID() {
        return this.id;
    }

    obtenerNombre() {
        return this.nombre;
    }

    obtenerCorreo() {
        return this.correo;
    }

    obtenerTelefono() {
        return this.telefono;
    }
}