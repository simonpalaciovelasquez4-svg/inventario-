# InventarioPlus - Sistema de Gestión de Inventarios

## Descripción
InventarioPlus es un sistema web completo de gestión de inventarios desarrollado con HTML5, Bootstrap 5, CSS y JavaScript Vanilla. Incluye un sistema de autenticación con roles de administrador y empleado, CRUD completo de productos, control automático de stock e historial de movimientos.

## Características Principales

### ✅ Cumplimiento de Requisitos
- **Tecnologías**: HTML5, Bootstrap 5, JavaScript Vanilla, localStorage
- **Persistencia Total**: Todos los datos se guardan en localStorage
- **Protección de Vistas**: Acceso restringido según rol del usuario

### 📊 Funcionalidades de Administrador
- ✅ **CRUD Completo de Productos**: Crear, leer, actualizar y eliminar
- ✅ **Gestión de Categorías**: Crear y administrar categorías de productos
- ✅ **Visualizar Inventario Completo**: Ver todos los productos con detalles
- ✅ **Historial Completo de Movimientos**: Con fecha, tipo, usuario y cambios de stock
- ✅ **Panel de Estadísticas**:
  - Productos con bajo stock
  - Productos sin stock
  - Productos más movidos
  - Valor total del inventario
  - Movimientos por día

### 📦 Funcionalidades de Empleado
- ✅ **Registrar Entradas**: Compras/recepciones de productos
- ✅ **Registrar Salidas**: Ventas, pérdidas o devoluciones
- ✅ **Consultar Inventario**: Ver productos disponibles y sus detalles
- ✅ **Historial de Movimientos**: Ver cambios recientes
- ✅ **Control Automático de Stock**: Actualización instantánea
- ❌ **No puede**: Crear, editar o eliminar productos

## Credenciales de Prueba

### Empleado
- **Email**: empleado@ejemplo.com
- **Contraseña**: 123456

### Administrador
- **Email**: admin@ejemplo.com
- **Contraseña**: admin123

## Estructura de Archivos

```
invetarioplus/
├── index.html              # Página de login
├── empleado.html           # Panel del empleado
├── administrador.html      # Panel del administrador
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   ├── auth.js             # Sistema de autenticación y gestión de datos
│   └── productos.js        # Funciones de interfaz para productos
└── README.md               # Este archivo
```

## Cómo Usar

### 1. Abrir la Aplicación
Abre `index.html` en tu navegador web (Chrome, Firefox, Edge, Safari, etc.)

### 2. Iniciar Sesión
- Selecciona el tipo de usuario (Empleado o Administrador)
- Ingresa las credenciales de prueba
- Haz clic en "Iniciar Sesión"

### 3. Panel de Empleado
**Tareas disponibles:**
- Ver inventario de productos
- Registrar entrada de productos (botón verde "Entrada")
- Registrar salida de productos (botón rojo "Salida")
- Ver historial de movimientos recientes
- Consultar estadísticas del inventario

### 4. Panel de Administrador
**Tareas disponibles:**
- **Productos**: Crear nuevo, editar, eliminar
- **Categorías**: Crear nuevas categorías
- **Inventario**: Ver todos los productos con estado
- **Estadísticas**: Productos bajo stock, valor total, movimientos
- **Historial**: Acceso a todos los movimientos del sistema

## Estructura de Datos en localStorage

### Categorías
```json
[
  { "id": 1, "nombre": "Electrónica" },
  { "id": 2, "nombre": "Accesorios" }
]
```

### Productos
```json
[
  {
    "id": 1,
    "codigo": "P001",
    "nombre": "Laptop Dell XPS 15",
    "categoria": 1,
    "precio": 1200.00,
    "stock": 45,
    "descripcion": "Laptop de alta gama",
    "fechaCreacion": "2026-08-05T..."
  }
]
```

### Movimientos
```json
[
  {
    "id": 1,
    "fecha": "2026-08-05T...",
    "tipo": "Entrada",
    "descripcion": "Compra a proveedor",
    "usuario": "Juan Pérez",
    "productoId": 1,
    "nombreProducto": "Laptop Dell XPS 15",
    "stockAnterior": 40,
    "stockNuevo": 45,
    "cantidad": 5
  }
]
```

## Funcionalidades Avanzadas

### Control Automático de Stock
- Cuando se registra una entrada: stock aumenta automáticamente
- Cuando se registra una salida: stock disminuye automáticamente
- Si no hay stock suficiente: aparece error y no se registra la salida

### Historial de Movimientos
- Cada cambio de stock se registra automáticamente
- Incluye: fecha/hora, tipo de movimiento, cantidad, usuario, stock anterior y nuevo
- Solo administrador puede ver el historial completo

### Estados de Productos
- **Disponible**: Stock > 0
- **Bajo Stock**: Stock <= 10
- **Sin Stock**: Stock = 0

## Características de Seguridad

1. **Autenticación por Rol**: Acceso diferenciado según tipo de usuario
2. **Validación de Sesión**: Se verifica automáticamente al abrir empleado.html o administrador.html
3. **Logout Seguro**: Limpia la sesión y redirige a login
4. **Persistencia Segura**: localStorage (nota: no es criptografía, es solo para demostración)

## Notas Importantes

- **Datos Locales**: Todos los datos se guardan en localStorage del navegador
- **Privacidad**: Los datos no se envían a ningún servidor
- **Borrado**: Si limpias el almacenamiento del navegador, se perderán los datos
- **Navegadores**: Compatible con Chrome, Firefox, Edge, Safari (versiones recientes)

## Flujo de la Aplicación

```
index.html (Login)
    ↓
[Verificar credenciales]
    ├→ Empleado → empleado.html
    └→ Admin → administrador.html
    
[Al cerrar sesión]
    → Vuelve a index.html
```

## Ampliaciones Futuras

Posibles mejoras:
- Agregar backend con base de datos real
- Exportar reportes en PDF/Excel
- Gráficos de estadísticas
- Gestión de usuarios desde la interfaz
- Sistema de roles más granular
- Auditoría y logs de acceso
- Búsqueda y filtros avanzados

## Soporte

Si encuentras problemas:
1. Verifica que JavaScript esté habilitado
2. Intenta limpiar el almacenamiento del navegador
3. Recarga la página (F5 o Ctrl+R)
4. Abre la consola (F12) para ver errores

## Licencia

Este proyecto es de demostración educativa.

---

**Última actualización**: 5 de Agosto, 2026
