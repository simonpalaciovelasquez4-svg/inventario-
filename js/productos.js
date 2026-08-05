/**
 * ==================== ARCHIVO: productos.js ====================
 * Gestiona toda la interfaz de usuario (UI) del sistema
 * Incluye: tablas, formularios, alertas, estadísticas
 * Trabaja con funciones de auth.js para la lógica de negocio
 * ===================================================
 */

// ==================== CARGAR SELECTOS DE PRODUCTOS ====================

/**
 * Carga los selectos (dropdowns) de productos
 * Se llama automáticamente en inicialización y después de cada operación
 * @void
 */
// Cargar selectos de productos
function cargarSelectsProductos() {
    const productos = obtenerProductos();
    const selectEntrada = document.getElementById('productoEntrada');
    const selectSalida = document.getElementById('productoSalida');

    if (selectEntrada) {
        selectEntrada.innerHTML = '<option value="">Selecciona un producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} (Stock: ${producto.stock})`;
            selectEntrada.appendChild(option);
        });
    }

    if (selectSalida) {
        selectSalida.innerHTML = '<option value="">Selecciona un producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} (Stock: ${producto.stock})`;
            selectSalida.appendChild(option);
        });
    }
}

/**
 * Procesa el formulario de registro de entrada
 * Valida datos, registra entrada, actualiza tablas e interfaz
 * @void
 */
// Registrar entrada desde formulario
function registrarEntradaForm() {
    const productoId = parseInt(document.getElementById('productoEntrada').value);
    const cantidad = parseInt(document.getElementById('cantidadEntrada').value);
    const razon = document.getElementById('razonEntrada').value.trim();
    const sesion = obtenerSesion();

    if (!productoId || !cantidad || !razon) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        registrarEntrada(productoId, cantidad, razon, sesion.nombre);
        mostrarExito('Entrada registrada correctamente');
        
        document.getElementById('formEntrada').reset();
        actualizarTablaProductosAdmin();
        actualizarTablaProductosEmpleado();
        actualizarTablaMovimientos();
        actualizarEstadisticas();
        cargarSelectsProductos();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

/**
 * Procesa el formulario de registro de salida
 * Valida datos, verifica stock disponible, registra salida, actualiza UI
 * @void
 */
// Registrar salida desde formulario
function registrarSalidaForm() {
    const productoId = parseInt(document.getElementById('productoSalida').value);
    const cantidad = parseInt(document.getElementById('cantidadSalida').value);
    const razon = document.getElementById('razonSalida').value.trim();
    const sesion = obtenerSesion();

    if (!productoId || !cantidad || !razon) {
        alert('Por favor completa todos los campos');
        return;
    }

    const producto = obtenerProductoPorId(productoId);
    if (producto.stock < cantidad) {
        alert('Stock insuficiente. Stock disponible: ' + producto.stock);
        return;
    }

    try {
        registrarSalida(productoId, cantidad, razon, sesion.nombre);
        mostrarExito('Salida registrada correctamente');
        
        document.getElementById('formSalida').reset();
        actualizarTablaProductosAdmin();
        actualizarTablaProductosEmpleado();
        actualizarTablaMovimientos();
        actualizarEstadisticas();
        cargarSelectsProductos();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

/**
 * Abre o cierra el formulario de crear/editar producto
 * Si productoId es null, crea nuevo producto; si no, edita existente
 * @param {number|null} productoId - ID del producto a editar o null para crear
 * @void
 */
// Abrir/cerrar formulario de producto
function abrirFormularioProducto(productoId = null) {
    const container = document.getElementById('formProductoContainer');
    const form = document.getElementById('formProducto');
    const titulo = document.getElementById('formProductoTitulo');

    if (productoId === null) {
        titulo.textContent = 'Crear Nuevo Producto';
        form.reset();
        form.dataset.modo = 'crear';
        delete form.dataset.productoId;
    } else {
        const producto = obtenerProductoPorId(productoId);
        if (!producto) return;
        
        titulo.textContent = 'Editar Producto';
        document.getElementById('productoCodigo').value = producto.codigo;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoCategoria').value = producto.categoria;
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoStock').value = producto.stock;
        document.getElementById('productoDescripcion').value = producto.descripcion;
        
        form.dataset.modo = 'editar';
        form.dataset.productoId = productoId;
    }

    container.classList.remove('d-none');
}

/**
 * Cierra el formulario de producto y limpia sus campos
 * @void
 */
function cancelarFormularioProducto() {
    document.getElementById('formProductoContainer').classList.add('d-none');
    document.getElementById('formProducto').reset();
}

/**
 * Guarda un producto nuevo o actualiza uno existente
 * Valida datos, llama a funciones de auth.js, actualiza tablas
 * @void
 */
// Guardar producto
function guardarProductoFormulario() {
    const form = document.getElementById('formProducto');
    const datos = {
        codigo: document.getElementById('productoCodigo').value,
        nombre: document.getElementById('productoNombre').value,
        categoria: document.getElementById('productoCategoria').value,
        precio: parseFloat(document.getElementById('productoPrecio').value),
        stock: parseInt(document.getElementById('productoStock').value),
        descripcion: document.getElementById('productoDescripcion').value
    };

    try {
        if (form.dataset.modo === 'crear') {
            crearProducto(datos);
            mostrarExito('Producto creado correctamente');
        } else {
            actualizarProducto(parseInt(form.dataset.productoId), datos);
            mostrarExito('Producto actualizado correctamente');
        }
        
        cancelarFormularioProducto();
        actualizarTablaProductosAdmin();
        actualizarTablaProductosEmpleado();
        actualizarEstadisticas();
        cargarSelectsProductos();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

/**
 * Solicita confirmación y elimina un producto del sistema
 * @param {number} productoId - ID del producto a eliminar
 * @void
 */
// Eliminar producto
function eliminarProductoConfirm(productoId) {
    const producto = obtenerProductoPorId(productoId);
    if (confirm(`¿Eliminar "${producto.nombre}"?`)) {
        eliminarProducto(productoId);
        mostrarExito('Producto eliminado correctamente');
        actualizarTablaProductosAdmin();
        actualizarTablaProductosEmpleado();
        actualizarEstadisticas();
        cargarSelectsProductos();
    }
}

/**
 * Selecciona un producto en el formulario de Entrada y navega hacia él
 * En la página de admin activa el tab "Registrar Movimiento"; en empleado hace scroll
 * @param {number} productoId - ID del producto a seleccionar
 * @void
 */
function seleccionarEntrada(productoId) {
    const select = document.getElementById('productoEntrada');
    if (!select) return;
    select.value = String(productoId);
    navegarAFormulario('formEntrada');
}

/**
 * Selecciona un producto en el formulario de Salida y navega hacia él
 * En la página de admin activa el tab "Registrar Movimiento"; en empleado hace scroll
 * @param {number} productoId - ID del producto a seleccionar
 * @void
 */
function seleccionarSalida(productoId) {
    const select = document.getElementById('productoSalida');
    if (!select) return;
    select.value = String(productoId);
    navegarAFormulario('formSalida');
}

/**
 * Navega hacia el formulario correspondiente (Entrada o Salida)
 * Si existe el tab "Registrar Movimiento" (página de admin), lo activa.
 * En caso contrario (página de empleado), simplemente hace scroll hasta el formulario.
 * @param {string} formId - ID del formulario a mostrar
 * @void
 */
function navegarAFormulario(formId) {
    // Si existe el tab "Registrar Movimiento" (solo en admin), activarlo
    const tabLink = document.querySelector('[href="#registroMovimientos"]');
    if (tabLink) {
        const tab = new bootstrap.Tab(tabLink);
        tab.show();
    }
    // Hacer scroll (o enfocar) el formulario correspondiente
    const formulario = document.getElementById(formId);
    if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==================== FUNCIONES DE TABLAS ====================

/**
 * Renderiza la tabla de productos para el panel del Administrador
 * Muestra: código, nombre, categoría, stock, precio, estado, acciones (editar/eliminar)
 * @void
 */
// Actualizar tabla de productos en admin
function actualizarTablaProductosAdmin() {
    const tabla = document.getElementById('tablaProductosAdmin');
    if (!tabla) return;
    
    const productos = obtenerProductos();
    const categorias = obtenerCategorias();
    
    tabla.innerHTML = '';
    
    productos.forEach(producto => {
        const categoria = categorias.find(c => c.id === producto.categoria);
        const estado = producto.stock === 0 ? 'Sin Stock' : 
                       producto.stock <= 10 ? 'Bajo Stock' : 'Activo';
        const claseBadge = producto.stock === 0 ? 'danger' : 
                           producto.stock <= 10 ? 'warning' : 'success';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><code>${producto.codigo}</code></td>
            <td>${producto.nombre}</td>
            <td>${categoria?.nombre || '-'}</td>
            <td><span class="badge bg-${claseBadge}">${producto.stock}</span></td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td><span class="badge bg-${estado === 'Activo' ? 'success' : estado === 'Bajo Stock' ? 'warning' : 'danger'}">${estado}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="abrirFormularioProducto(${producto.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProductoConfirm(${producto.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

/**
 * Renderiza la tabla de productos para el panel del Empleado
 * Muestra: código, nombre, categoría, stock, precio, estado, botones (entrada/salida)
 * Diferencia con admin: botones de entrada/salida en lugar de editar/eliminar
 * @void
 */
// Actualizar tabla de productos en empleado
function actualizarTablaProductosEmpleado() {
    const tabla = document.getElementById('tablaProductosEmpleado');
    if (!tabla) return;
    
    const productos = obtenerProductos();
    const categorias = obtenerCategorias();
    
    tabla.innerHTML = '';
    
    productos.forEach(producto => {
        const categoria = categorias.find(c => c.id === producto.categoria);
        const estado = producto.stock === 0 ? 'Sin Stock' : 
                       producto.stock <= 10 ? 'Bajo Stock' : 'Disponible';
        const claseBadge = producto.stock === 0 ? 'danger' : 
                           producto.stock <= 10 ? 'warning' : 'success';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><code>${producto.codigo}</code></td>
            <td>${producto.nombre}</td>
            <td>${categoria?.nombre || '-'}</td>
            <td><span class="badge bg-${claseBadge}">${producto.stock}</span></td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td><span class="badge bg-${estado === 'Disponible' ? 'success' : estado === 'Bajo Stock' ? 'warning' : 'danger'}">${estado}</span></td>
<td>
                <button class="btn btn-sm btn-success" onclick="seleccionarEntrada(${producto.id})">
                    <i class="bi bi-plus"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="seleccionarSalida(${producto.id})">
                    <i class="bi bi-dash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

/**
 * Renderiza la tabla del historial de movimientos
 * Muestra: fecha, producto, tipo (Entrada/Salida), descripción, usuario, cantidad, stock nuevo
 * Muestra los últimos 50 movimientos ordenados por fecha descendente
 * @void
 */
// Actualizar tabla de movimientos
function actualizarTablaMovimientos() {
    const tabla = document.getElementById('tablaMovimientos');
    if (!tabla) return;
    
    const movimientos = obtenerMovimientos().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 50);
    tabla.innerHTML = '';
    
    if (movimientos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Sin movimientos registrados</td></tr>';
        return;
    }
    
    movimientos.forEach(mov => {
        const fecha = new Date(mov.fecha);
        const fechaFormato = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        
        const claseColor = mov.tipo === 'Entrada' ? 'success' : 
                           mov.tipo === 'Salida' ? 'danger' : 
                           mov.tipo === 'Creación' ? 'info' : 'secondary';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${fechaFormato}</td>
            <td>${mov.nombreProducto}</td>
            <td><span class="badge bg-${claseColor}">${mov.tipo}</span></td>
            <td>${mov.descripcion}</td>
            <td>${mov.usuario}</td>
            <td>${mov.cantidad}</td>
            <td>${mov.stockNuevo}</td>
        `;
        tabla.appendChild(fila);
    });
}

// ==================== GESTIÓN DE CATEGORÍAS ====================

/**
 * Procesa el formulario de creación de categoría
 * Valida datos, crea nueva categoría, actualiza selectos y lista
 * @void
 */
// Guardar categoría desde formulario
function guardarCategoriaFormulario() {
    const nombre = document.getElementById('categoriaNombre').value.trim();
    
    if (!nombre) {
        alert('Por favor ingresa el nombre de la categoría');
        return;
    }
    
    const categorias = obtenerCategorias();
    const nuevoId = Math.max(...categorias.map(c => c.id), 0) + 1;
    categorias.push({ id: nuevoId, nombre });
    
    guardarCategorias(categorias);
    document.getElementById('formCategoria').reset();
    mostrarExito('Categoría creada correctamente');
    actualizarListaCategorias();
    actualizarSelectsCategorias();
}

/**
 * Renderiza la lista de categorías existentes con cantidad de productos por categoría
 * @void
 */
// Actualizar lista de categorías
function actualizarListaCategorias() {
    const lista = document.getElementById('listaCategoriasAdmin');
    if (!lista) return;
    
    const categorias = obtenerCategorias();
    const productos = obtenerProductos();
    
    lista.innerHTML = '';
    
    categorias.forEach(cat => {
        const cantidad = productos.filter(p => p.categoria === cat.id).length;
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            ${cat.nombre}
            <span class="badge bg-primary rounded-pill">${cantidad}</span>
        `;
        lista.appendChild(item);
    });
}

/**
 * Recarga todos los selectos (dropdowns) de categorías en la página
 * Se llama después de crear una nueva categoría
 * @void
 */
// Actualizar selects de categorías
function actualizarSelectsCategorias() {
    const selects = document.querySelectorAll('select[id*="Categoria"]');
    const categorias = obtenerCategorias();
    
    selects.forEach(select => {
        const valorActual = select.value;
        select.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
        select.value = valorActual;
    });
}

// ==================== ESTADÍSTICAS ====================

function actualizarEstadisticas() {
    const stats = obtenerEstadisticas();
    
    // Actualizar tarjetas de estadísticas
    const elementos = {
        'totalProductos': stats.totalProductos,
        'valorInventario': '$' + stats.valorTotalInventario.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
        'productosActivos': stats.productosActivos,
        'productosSinStock': stats.productosSinStock,
        'productosBajoStock': stats.productosBajoStock,
        'totalMovimientos': stats.totalMovimientos,
        'movimientosHoy': stats.movimientosHoy
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = valor;
    }
}

// ==================== ALERTAS ====================

function mostrarExito(mensaje) {
    const alertDiv = document.getElementById('alertExito');
    if (alertDiv) {
        document.getElementById('alertExitoText').textContent = mensaje;
        alertDiv.classList.remove('d-none');
        setTimeout(() => alertDiv.classList.add('d-none'), 3000);
    }
}

// ==================== INICIALIZACIÓN ====================

function inicializarInterfazProductos() {
    // Asegura que los datos por defecto existan en localStorage antes de
    // pintar la interfaz. Esto evita tablas vacías si el almacenamiento
    // fue limpiado, quedó vacío o contiene datos inválidos.
    inicializarBaseDatos();
    actualizarSelectsCategorias();
    cargarSelectsProductos();
    actualizarEstadisticas();
}
