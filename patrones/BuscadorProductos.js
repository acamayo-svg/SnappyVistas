// patrones/BuscadorProductos.js

// Estrategia Concreta 1: Búsqueda por Nombre
export class BusquedaPorNombre {
    buscar(criterio, productos) {
        const criterioBusqueda = criterio.toLowerCase().trim();
        
        if (!criterioBusqueda) {
            return [];
        }

        const resultados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(criterioBusqueda)
        );

        return resultados;
    }

    obtenerNombreEstrategia() {
        return 'Búsqueda por Nombre';
    }
}

// Estrategia Concreta 2: Búsqueda por Categoría
export class BusquedaPorCategoria {
    buscar(criterio, productos) {
        const categoriaBusqueda = criterio.toLowerCase().trim();
        
        if (!categoriaBusqueda) {
            return [];
        }

        const resultados = productos.filter(producto => 
            producto.categoria && producto.categoria.toLowerCase().includes(categoriaBusqueda)
        );

        return resultados;
    }

    obtenerNombreEstrategia() {
        return 'Búsqueda por Categoría';
    }
}

// Estrategia Concreta 3: Búsqueda por Rango de Precio
export class BusquedaPorPrecio {
    buscar(criterio, productos) {
        const rangos = criterio.split('-');
        
        if (rangos.length !== 2) {
            return [];
        }

        const [precioMinStr, precioMaxStr] = rangos;
        const precioMin = parseFloat(precioMinStr.trim());
        const precioMax = parseFloat(precioMaxStr.trim());

        if (isNaN(precioMin) || isNaN(precioMax) || precioMin > precioMax) {
            return [];
        }

        const resultados = productos.filter(producto => 
            producto.precio >= precioMin && producto.precio <= precioMax
        );

        return resultados;
    }

    obtenerNombreEstrategia() {
        return 'Búsqueda por Precio';
    }
}

// Context - Clase que utiliza las estrategias
export class BuscadorProductos {
    constructor(estrategia) {
        this.estrategia = estrategia || new BusquedaPorNombre();
        this.productos = [];
    }

    establecerEstrategia(estrategia) {
        this.estrategia = estrategia;
    }

    cargarProductos(productos) {
        this.productos = productos;
    }

    ejecutarBusqueda(criterio) {
        if (!this.estrategia || this.productos.length === 0) {
            return [];
        }
        
        return this.estrategia.buscar(criterio, this.productos);
    }

    buscarPorNombre(nombre) {
        this.establecerEstrategia(new BusquedaPorNombre());
        return this.ejecutarBusqueda(nombre);
    }

    buscarPorCategoria(categoria) {
        this.establecerEstrategia(new BusquedaPorCategoria());
        return this.ejecutarBusqueda(categoria);
    }

    buscarPorPrecio(precioMin, precioMax) {
        this.establecerEstrategia(new BusquedaPorPrecio());
        return this.ejecutarBusqueda(`${precioMin}-${precioMax}`);
    }

    obtenerEstrategiaActual() {
        return this.estrategia.obtenerNombreEstrategia();
    }

    obtenerCantidadProductos() {
        return this.productos.length;
    }

    obtenerProductosDisponibles() {
        return this.productos;
    }
}