# Modelo Relacional Optimizado - SnappyVistas

## Diagrama Mermaid (Solo campos utilizados)

```mermaid
erDiagram
    USUARIOS {
        int id PK
        string nombre
        string correo
        string telefono
        string password_hash
        string tipo_usuario
        int estado
    }

    PRODUCTOS {
        int id PK
        int establecimiento_id FK
        string nombre
        string descripcion
        decimal precio
        int unidades_disponibles
        string categoria
        int estado
    }

    PEDIDOS {
        int id PK
        int establecimiento_id FK
        int domiciliario_id FK
        decimal total
        string items_json
        string estado
        string preference_id
        string datos_cliente_json
        string direccion_entrega
        string telefono_cliente
        string notas_especiales
    }

    ESTADOS_ESTABLECIMIENTOS {
        int id PK
        int establecimiento_id FK
        int activo
    }

    LATIDO_ESTABLECIMIENTO {
        int establecimiento_id PK,FK
        timestamp ultimo_latido
    }

    INTENTOS_LOGIN {
        int id PK
        int usuario_id FK
        string correo
        string ip
        int exito
        timestamp creado_en
    }

    USUARIOS ||--o{ PRODUCTOS : "1:N"
    USUARIOS ||--o{ PEDIDOS : "1:N (establecimiento)"
    USUARIOS ||--o{ PEDIDOS : "1:N (domiciliario)"
    USUARIOS ||--|| ESTADOS_ESTABLECIMIENTOS : "1:1"
    USUARIOS ||--|| LATIDO_ESTABLECIMIENTO : "1:1"
    USUARIOS ||--o{ INTENTOS_LOGIN : "1:N"
```

## Campos Eliminados

### USUARIOS
- ❌ `creado_en` - No se consulta
- ❌ `actualizado_en` - No se consulta

### PRODUCTOS  
- ❌ `imagen_url` - No se utiliza
- ❌ `creado_en` - No se consulta
- ❌ `actualizado_en` - No se consulta

### PEDIDOS
- ❌ `created_at` - No se consulta
- ❌ `updated_at` - Solo se actualiza pero no se consulta

### ESTABLECIMIENTOS_ESTADO
- ❌ `fecha_activacion` - No se utiliza
- ❌ `fecha_desactivacion` - No se utiliza  
- ❌ `motivo_desactivacion` - No se utiliza
- ❌ `creado_en` - No se consulta
- ❌ `actualizado_en` - No se consulta

## Beneficios de la Limpieza

1. **Menor tamaño de base de datos** - Menos campos = menos espacio
2. **Mejor rendimiento** - Menos datos que procesar
3. **Estructura más clara** - Solo campos que realmente se usan
4. **Mantenimiento más fácil** - Menos campos que gestionar
5. **Consultas más rápidas** - Menos columnas en SELECT *

## Instrucciones de Aplicación

1. **Hacer backup** de la base de datos actual
2. **Ejecutar** `limpiar_atributos_no_utilizados.sql`
3. **Verificar** que todo funciona correctamente
4. **Usar** `snappy_simple_limpio.sql` para nuevas instalaciones
