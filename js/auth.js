/**
 * ==================== ARCHIVO: auth.js ====================
 * Gestiona la autenticación, CRUD de productos, movimientos e inventario
 * Base de datos: localStorage (sin servidor backend)
 * ===================================================
 */

// ==================== Base de datos de usuarios de prueba ====================
/**
 * Objeto con credenciales de prueba
 * Estructura: { rol: [usuarios] }
 * CREDENCIALES DE PRUEBA:
 *   - Empleado: empleado@ejemplo.com / 123456
 *   - Admin: admin@ejemplo.com / admin123
 */
const usuariosPrueba = {
    empleado: [
        { email: 'empleado@ejemplo.com', password: '123456', nombre: 'Juan Pérez', rol: 'empleado' },
        { email: 'empleado2@ejemplo.com', password: '123456', nombre: 'María García', rol: 'empleado' }
    ],
    administrador: [
        { email: 'admin@ejemplo.com', password: 'admin123', nombre: 'Administrador', rol: 'administrador' }
    ]
};

// ==================== Sistema de Categorías ====================
/**
 * Categorías predefinidas del sistema
 * Usadas para clasificar productos
 * Estructura: { id: número único, nombre: string }
 */
const categoriasDefault = [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Accesorios' },
    { id: 3, nombre: 'Software' },
    { id: 4, nombre: 'Periféricos' }
];

// ==================== Productos de Prueba ====================
/**
 * Productos iniciales para demostración
 * Se cargan en localStorage la primera vez que se abre la app
 * Estructura: { id, codigo, nombre, categoria, precio, stock, descripcion, fechaCreacion }
 */
const productosDefault = [
    { id: 1, codigo: 'P001', nombre: 'Laptop Dell XPS 15', categoria: 1, precio: 1200.00, stock: 45, descripcion: 'Laptop de alta gama', fechaCreacion: new Date().toISOString() },
    { id: 2, codigo: 'P002', nombre: 'Mouse Logitech MX Master', categoria: 2, precio: 99.99, stock: 8, descripcion: 'Mouse inalámbrico premium', fechaCreacion: new Date().toISOString() },
    { id: 3, codigo: 'P003', nombre: 'Teclado Mecánico RGB', categoria: 2, precio: 150.00, stock: 2, descripcion: 'Teclado mecánico con RGB', fechaCreacion: new Date().toISOString() },
    { id: 4, codigo: 'P004', nombre: 'Monitor 4K LG 27"', categoria: 1, precio: 450.00, stock: 15, descripcion: 'Monitor Ultra HD', fechaCreacion: new Date().toISOString() },
    { id: 5, codigo: 'P005', nombre: 'Headset Corsair Void', categoria: 2, precio: 120.00, stock: 22, descripcion: 'Audífonos inalámbricos gaming', fechaCreacion: new Date().toISOString() }
];

// ==================== Inicializar Base de Datos en localStorage ====================
/**
 * Inicializa la base de datos en localStorage si no existe
 * Crea las colecciones: categorias, productos, movimientos
 * Se ejecuta automáticamente al cargar el script
 */
/**
 * Comprueba si un valor guardado en localStorage es un array válido y NO vacío.
 * Se usa para decidir si los datos por defecto deben repoblar el almacenamiento.
 * @param {string} clave - Nombre de la clave en localStorage.
 * @returns {boolean} true si el valor es un array no vacío, false en caso contrario.
 */
function almacenamientoValidoNoVacio(clave) {
    try {
        const valor = JSON.parse(localStorage.getItem(clave));
        return Array.isArray(valor) && valor.length > 0;
    } catch (e) {
        // Si el JSON es inválido o hay cualquier otro error, considerar inválido
        return false;
    }
}

function inicializarBaseDatos() {
    // CATEGORÍAS: repoblar cuando no existan, estén vacías o sean inválidas
    if (!almacenamientoValidoNoVacio('categorias')) {
        localStorage.setItem('categorias', JSON.stringify(categoriasDefault));
    }
    // PRODUCTOS: repoblar cuando no existan, estén vacíos o sean inválidos
    if (!almacenamientoValidoNoVacio('productos')) {
        localStorage.setItem('productos', JSON.stringify(productosDefault));
    }
    // MOVIMIENTOS: solo inicializar si no existe (puede estar vacío legítimamente)
    if (!localStorage.getItem('movimientos')) {
        localStorage.setItem('movimientos', JSON.stringify([]));
    }
    // EMPLEADOS: solo inicializar si no existe o está vacío
    if (!almacenamientoValidoNoVacio('empleados')) {
        // Inicializar empleados desde los usuarios de prueba
        const empleadosIniciales = usuariosPrueba.empleado.map((emp, index) => ({
            id: index + 1,
            nombre: emp.nombre,
            email: emp.email,
            password: emp.password,
            rol: 'empleado',
            fechaRegistro: new Date().toISOString()
        }));
        localStorage.setItem('empleados', JSON.stringify(empleadosIniciales));
    }
}

// Inicializar al cargar el script
inicializarBaseDatos();

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

/**
 * Valida las credenciales del usuario contra la lista de usuarios de prueba
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} rol - Rol del usuario (empleado o administrador)
 * @returns {object|null} Usuario si es válido, null si no
 */
// Validar login
function validarLogin(email, password, rol) {
    if (rol === 'empleado') {
        // Validar contra los empleados registrados en localStorage
        const empleados = obtenerEmpleados();
        return empleados.find(emp => emp.email === email && emp.password === password);
    }
    
    const usuarios = usuariosPrueba[rol];
    if (!usuarios) return null;
    
    return usuarios.find(user => user.email === email && user.password === password);
}

/**
 * Guarda los datos de la sesión en localStorage
 * @param {object} usuario - Objeto usuario validado
 */
// Guardar sesión
function guardarSesion(usuario) {
    const sesion = {
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('sesionActual', JSON.stringify(sesion));
}

/**
 * Obtiene los datos de la sesión actual desde localStorage
 * @returns {object|null} Datos de sesión o null si no existe
 */
// Obtener sesión actual
function obtenerSesion() {
    const sesion = localStorage.getItem('sesionActual');
    return sesion ? JSON.parse(sesion) : null;
}

/**
 * Cierra la sesión y redirige a la página de login
 */
// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('sesionActual');
    window.location.href = 'index.html';
}

/**
 * Verifica si hay una sesión activa
 * Si no existe, redirige a login
 * @returns {object|null} Datos de sesión o null
 */
// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'index.html';
        return null;
    }
    return sesion;
}

// ==================== MANEJADOR DEL FORMULARIO DE LOGIN ====================
/**
 * Event listener para el formulario de login
 * Valida credenciales y redirige al dashboard correspondiente
 */
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rol = document.getElementById('role').value;
            const alertMessage = document.getElementById('alertMessage');
            const alertText = document.getElementById('alertText');

            // Validación
            if (!email || !password || !rol) {
                mostrarError('Por favor completa todos los campos', alertMessage, alertText);
                return;
            }

            // Validar credenciales
            const usuario = validarLogin(email, password, rol);
            if (!usuario) {
                mostrarError('Correo o contraseña incorrectos', alertMessage, alertText);
                return;
            }

            // Guardar sesión y redirigir
            guardarSesion(usuario);
            if (usuario.rol === 'empleado') {
                window.location.href = 'empleado.html';
            } else if (usuario.rol === 'administrador') {
                window.location.href = 'administrador.html';
            }
        });
    }
});

/**
 * Muestra un mensaje de error en la UI
 * @param {string} mensaje - Mensaje a mostrar
 * @param {element} alertDiv - Elemento del alerta
 * @param {element} alertText - Elemento de texto del alerta
 */
// Mostrar error
function mostrarError(mensaje, alertDiv, alertText) {
    alertText.textContent = mensaje;
    alertDiv.classList.remove('d-none');
    alertDiv.classList.add('show');
    setTimeout(() => {
        alertDiv.classList.add('d-none');
    }, 5000);
}

// ==================== FUNCIONES PARA LAS PÁGINAS DE DASHBOARD ====================

/**
 * Carga y muestra la información del usuario en la navbar
 * Muestra el rol y nombre del usuario autenticado
 */
// Cargar información del usuario en la navbar
function cargarInfoUsuario() {
    const sesion = verificarAutenticacion();
    if (!sesion) return;

    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        userInfoDiv.innerHTML = `
            <div class="user-info">
                <span class="user-badge">${sesion.rol === 'administrador' ? 'Admin' : 'Empleado'}</span>
                <span class="text-white">${sesion.nombre}</span>
            </div>
        `;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }
}

/**
 * Inicializa el dashboard del usuario
 * Verifica autenticación, carga info del usuario, y personaliza según el rol
 */
// Cargar datos de inicialización del usuario
function inicializarDashboard() {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'index.html';
        return;
    }

    // Actualizar información del usuario
    cargarInfoUsuario();

    // Personalizar según el rol
    const rol = sesion.rol;
    
    // Actualizar elementos específicos del rol
    document.querySelectorAll('[data-role]').forEach(elemento => {
        if (elemento.dataset.role !== rol) {
            elemento.style.display = 'none';
        }
    });
}

// Ejecutar inicialización solo en páginas de dashboard (no en index.html)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en una página de dashboard (empleado o administrador)
    const paginaActual = window.location.pathname;
    if (paginaActual.includes('empleado.html') || paginaActual.includes('administrador.html')) {
        inicializarDashboard();
    }
});

// ==================== CRUD DE PRODUCTOS ====================

/**
 * Obtiene todos los productos del localStorage
 * @returns {array} Array de productos
 */
// Obtener todos los productos
function obtenerProductos() {
    return JSON.parse(localStorage.getItem('productos') || '[]');
}

/**
 * Obtiene todas las categorías del localStorage
 * @returns {array} Array de categorías
 */
// Obtener categorías
function obtenerCategorias() {
    return JSON.parse(localStorage.getItem('categorias') || '[]');
}

/**
 * Obtiene todos los movimientos del localStorage
 * @returns {array} Array de movimientos
 */
// Obtener movimientos
function obtenerMovimientos() {
    return JSON.parse(localStorage.getItem('movimientos') || '[]');
}

/**
 * Guarda la lista de productos en localStorage
 * @param {array} productos - Array de productos a guardar
 */
// Guardar productos
function guardarProductos(productos) {
    localStorage.setItem('productos', JSON.stringify(productos));
}

/**
 * Guarda la lista de categorías en localStorage
 * @param {array} categorias - Array de categorías a guardar
 */
// Guardar categorías
function guardarCategorias(categorias) {
    localStorage.setItem('categorias', JSON.stringify(categorias));
}

/**
 * Guarda la lista de movimientos en localStorage
 * @param {array} movimientos - Array de movimientos a guardar
 */
// Guardar movimientos
function guardarMovimientos(movimientos) {
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
}

/**
 * Crea un nuevo producto (Solo Administrador)
 * @param {object} datos - { codigo, nombre, categoria, precio, stock, descripcion }
 * @returns {object} Producto creado
 */
// Crear nuevo producto (solo Admin)
function crearProducto(datos) {
    const productos = obtenerProductos();
    const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
    
    const nuevoProducto = {
        id: nuevoId,
        codigo: datos.codigo,
        nombre: datos.nombre,
        categoria: parseInt(datos.categoria),
        precio: parseFloat(datos.precio),
        stock: parseInt(datos.stock),
        descripcion: datos.descripcion || '',
        fechaCreacion: new Date().toISOString()
    };
    
    productos.push(nuevoProducto);
    guardarProductos(productos);
    
    // Registrar movimiento
    registrarMovimiento('Creación de producto', 'admin', 'Creación', nuevoProducto.id, 0, nuevoProducto.stock);
    
    return nuevoProducto;
}

/**
 * Actualiza un producto existente (Solo Administrador)
 * @param {number} id - ID del producto a actualizar
 * @param {object} datos - Datos a actualizar
 * @returns {object|null} Producto actualizado o null si no existe
 */
// Actualizar producto (solo Admin)
function actualizarProducto(id, datos) {
    const productos = obtenerProductos();
    const indice = productos.findIndex(p => p.id === id);
    
    if (indice === -1) return null;
    
    const productoAnterior = productos[indice];
    productos[indice] = {
        ...productoAnterior,
        codigo: datos.codigo || productoAnterior.codigo,
        nombre: datos.nombre || productoAnterior.nombre,
        categoria: datos.categoria ? parseInt(datos.categoria) : productoAnterior.categoria,
        precio: datos.precio ? parseFloat(datos.precio) : productoAnterior.precio,
        stock: datos.stock !== undefined ? parseInt(datos.stock) : productoAnterior.stock,
        descripcion: datos.descripcion !== undefined ? datos.descripcion : productoAnterior.descripcion
    };
    
    guardarProductos(productos);
    return productos[indice];
}

/**
 * Elimina un producto del sistema (Solo Administrador)
 * @param {number} id - ID del producto a eliminar
 * @returns {object|null} Producto eliminado o null si no existe
 */
// Eliminar producto (solo Admin)
function eliminarProducto(id) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return null;
    
    const productosFiltrados = productos.filter(p => p.id !== id);
    guardarProductos(productosFiltrados);
    
    // Registrar movimiento
    registrarMovimiento('Eliminación de producto', 'admin', 'Eliminación', id, producto.stock, 0);
    
    return producto;
}

/**
 * Obtiene un producto específico por su ID
 * @param {number} id - ID del producto a buscar
 * @returns {object|undefined} Producto o undefined si no existe
 */
// Obtener un producto por ID
function obtenerProductoPorId(id) {
    const productos = obtenerProductos();
    return productos.find(p => p.id === id);
}

// ==================== CRUD DE EMPLEADOS ====================

/**
 * Obtiene todos los empleados registrados en localStorage
 * @returns {array} Array de empleados
 */
// Obtener todos los empleados
function obtenerEmpleados() {
    return JSON.parse(localStorage.getItem('empleados') || '[]');
}

/**
 * Guarda la lista de empleados en localStorage
 * @param {array} empleados - Array de empleados a guardar
 */
// Guardar empleados
function guardarEmpleados(empleados) {
    localStorage.setItem('empleados', JSON.stringify(empleados));
}

/**
 * Obtiene un empleado específico por su ID
 * @param {number} id - ID del empleado a buscar
 * @returns {object|undefined} Empleado o undefined si no existe
 */
// Obtener un empleado por ID
function obtenerEmpleadoPorId(id) {
    const empleados = obtenerEmpleados();
    return empleados.find(emp => emp.id === id);
}

/**
 * Obtiene un empleado por su email (para validar duplicados)
 * @param {string} email - Email del empleado a buscar
 * @returns {object|undefined} Empleado o undefined si no existe
 */
// Obtener un empleado por email
function obtenerEmpleadoPorEmail(email) {
    const empleados = obtenerEmpleados();
    return empleados.find(emp => emp.email.toLowerCase() === email.toLowerCase());
}

/**
 * Crea un nuevo empleado (Solo Administrador)
 * @param {object} datos - { nombre, email, password }
 * @returns {object} Empleado creado
 */
// Crear nuevo empleado (solo Admin)
function crearEmpleado(datos) {
    const empleados = obtenerEmpleados();
    const nuevoId = Math.max(...empleados.map(emp => emp.id), 0) + 1;
    
    const nuevoEmpleado = {
        id: nuevoId,
        nombre: datos.nombre,
        email: datos.email,
        password: datos.password,
        rol: 'empleado',
        fechaRegistro: new Date().toISOString()
    };
    
    empleados.push(nuevoEmpleado);
    guardarEmpleados(empleados);
    
    return nuevoEmpleado;
}

/**
 * Actualiza un empleado existente (Solo Administrador)
 * @param {number} id - ID del empleado a actualizar
 * @param {object} datos - Datos a actualizar
 * @returns {object|null} Empleado actualizado o null si no existe
 */
// Actualizar empleado (solo Admin)
function actualizarEmpleado(id, datos) {
    const empleados = obtenerEmpleados();
    const indice = empleados.findIndex(emp => emp.id === id);
    
    if (indice === -1) return null;
    
    const empleadoAnterior = empleados[indice];
    empleados[indice] = {
        ...empleadoAnterior,
        nombre: datos.nombre || empleadoAnterior.nombre,
        email: datos.email || empleadoAnterior.email,
        password: datos.password || empleadoAnterior.password
    };
    
    guardarEmpleados(empleados);
    return empleados[indice];
}

/**
 * Elimina un empleado del sistema (Solo Administrador)
 * @param {number} id - ID del empleado a eliminar
 * @returns {object|null} Empleado eliminado o null si no existe
 */
// Eliminar empleado (solo Admin)
function eliminarEmpleado(id) {
    const empleados = obtenerEmpleados();
    const empleado = empleados.find(emp => emp.id === id);
    
    if (!empleado) return null;
    
    const empleadosFiltrados = empleados.filter(emp => emp.id !== id);
    guardarEmpleados(empleadosFiltrados);
    
    return empleado;
}

// ==================== GESTIÓN DE MOVIMIENTOS ====================

/**
 * Registra una entrada de producto (Compra/Recepción)
 * Incrementa el stock y crea un registro en el historial
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad a ingresar
 * @param {string} razon - Motivo de la entrada
 * @param {string} usuario - Usuario que realiza la operación
 * @returns {object|null} Registro de entrada o null si hay error
 */
// Registrar entrada de producto (Compra)
function registrarEntrada(productoId, cantidad, razon, usuario) {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) return null;
    
    const stockAnterior = producto.stock;
    const nuevoStock = stockAnterior + cantidad;
    
    // Actualizar stock
    actualizarProducto(productoId, { stock: nuevoStock });
    
    // Registrar movimiento
    registrarMovimiento(razon, usuario, 'Entrada', productoId, stockAnterior, nuevoStock);
    
    return { productoId, cantidad, stockAnterior, nuevoStock };
}

/**
 * Registra una salida de producto (Venta/Pérdida)
 * Decrementa el stock (solo si hay suficiente) y crea un registro en el historial
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad a descontar
 * @param {string} razon - Motivo de la salida
 * @param {string} usuario - Usuario que realiza la operación
 * @returns {object|null} Registro de salida o null si hay error o stock insuficiente
 */
// Registrar salida de producto (Venta/Pérdida)
function registrarSalida(productoId, cantidad, razon, usuario) {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) return null;
    
    if (producto.stock < cantidad) {
        return null; // Stock insuficiente
    }
    
    const stockAnterior = producto.stock;
    const nuevoStock = stockAnterior - cantidad;
    
    // Actualizar stock
    actualizarProducto(productoId, { stock: nuevoStock });
    
    // Registrar movimiento
    registrarMovimiento(razon, usuario, 'Salida', productoId, stockAnterior, nuevoStock);
    
    return { productoId, cantidad, stockAnterior, nuevoStock };
}

/**
 * Registra un movimiento en el historial del sistema
 * Se llama automáticamente desde registrarEntrada, registrarSalida, etc.
 * @param {string} descripcion - Descripción del movimiento
 * @param {string} usuario - Usuario que realiza la operación
 * @param {string} tipo - Tipo: Entrada, Salida, Creación, Eliminación
 * @param {number} productoId - ID del producto
 * @param {number} stockAnterior - Stock antes del movimiento
 * @param {number} stockNuevo - Stock después del movimiento
 * @returns {object} Movimiento registrado
 */
// Registrar movimiento en el historial
function registrarMovimiento(descripcion, usuario, tipo, productoId, stockAnterior, stockNuevo) {
    const movimientos = obtenerMovimientos();
    
    const producto = obtenerProductoPorId(productoId);
    const nuevoMovimiento = {
        id: movimientos.length + 1,
        fecha: new Date().toISOString(),
        tipo: tipo, // 'Entrada', 'Salida', 'Creación', 'Eliminación'
        descripcion: descripcion,
        usuario: usuario,
        productoId: productoId,
        nombreProducto: producto?.nombre || 'Producto eliminado',
        stockAnterior: stockAnterior,
        stockNuevo: stockNuevo,
        cantidad: Math.abs(stockNuevo - stockAnterior)
    };
    
    movimientos.push(nuevoMovimiento);
    guardarMovimientos(movimientos);
    
    return nuevoMovimiento;
}

// ==================== ESTADÍSTICAS ====================

/**
 * Obtiene productos con stock bajo (por debajo del límite especificado)
 * @param {number} limite - Cantidad máxima de stock para considerarse bajo (default: 10)
 * @returns {array} Array de productos con stock bajo
 */
// Obtener productos con bajo stock
function obtenerProductosBajoStock(limite = 10) {
    return obtenerProductos().filter(p => p.stock <= limite);
}

/**
 * Obtiene los productos con más movimientos (entradas/salidas)
 * @param {number} limite - Cantidad máxima de productos a retornar (default: 5)
 * @returns {array} Array de productos ordenados por cantidad de movimientos
 */
// Obtener productos más movidos
function obtenerProductosMasMovidos(limite = 5) {
    const movimientos = obtenerMovimientos();
    const conteo = {};
    
    movimientos.forEach(mov => {
        conteo[mov.productoId] = (conteo[mov.productoId] || 0) + 1;
    });
    
    return Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([id, count]) => ({
            producto: obtenerProductoPorId(parseInt(id)),
            movimientos: count
        }));
}

/**
 * Obtiene un resumen completo de estadísticas del inventario
 * Incluye totales, valores, stocks, y movimientos del día
 * @returns {object} Objeto con todas las estadísticas
 */
// Obtener resumen de estadísticas
function obtenerEstadisticas() {
    const productos = obtenerProductos();
    const movimientos = obtenerMovimientos();
    
    const totalProductos = productos.length;
    const valorTotalInventario = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    const productosActivos = productos.filter(p => p.stock > 0).length;
    const productosSinStock = productos.filter(p => p.stock === 0).length;
    const productosBajoStock = obtenerProductosBajoStock().length;
    const totalMovimientos = movimientos.length;
    
    return {
        totalProductos,
        valorTotalInventario,
        productosActivos,
        productosSinStock,
        productosBajoStock,
        totalMovimientos,
        movimientosHoy: movimientos.filter(m => {
            const fecha = new Date(m.fecha);
            const hoy = new Date();
            return fecha.toDateString() === hoy.toDateString();
        }).length
    };
}
