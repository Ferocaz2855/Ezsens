let productos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarPedidos();
    
    // Navegación entre secciones
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Actualizar navegación activa
            document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
            document.getElementById(`${section}-section`).style.display = 'block';
        });
    });
});

// Funciones de gestión de productos
function cargarProductos() {
    // En una implementación real, esto vendría de una API
    fetch('../assets/data/productos.json')
        .then(response => response.json())
        .then(data => {
            productos = data.productos;
            mostrarProductos();
            mostrarInventario();
        });
}

function mostrarProductos() {
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    
    productos.forEach(producto => {
        const productCard = `
            <div class="product-admin-card">
                <div class="product-admin-image" 
                     style="background-image: url('../${producto.imagen}')"></div>
                <div class="product-admin-info">
                    <h4>${producto.nombre}</h4>
                    <p>$${producto.precio} | ${producto.sku}</p>
                    <p>Stock: ${producto.stock}</p>
                </div>
                <div class="product-admin-actions">
                    <button onclick="editarProducto(${producto.id})">Editar</button>
                    <button onclick="eliminarProducto(${producto.id})" class="btn-delete">Eliminar</button>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

function mostrarFormProducto() {
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('formProducto').reset();
    document.getElementById('productId').value = '';
}

function ocultarFormProducto() {
    document.getElementById('productForm').style.display = 'none';
}

function guardarProducto() {
    const id = document.getElementById('productId').value;
    const nuevoProducto = {
        nombre: document.getElementById('productNombre').value,
        categoria: document.getElementById('productCategoria').value,
        precio: parseFloat(document.getElementById('productPrecio').value),
        bonos: document.getElementById('productBonos').value,
        sku: document.getElementById('productSku').value,
        stock: parseInt(document.getElementById('productStock').value),
        descripcion: document.getElementById('productDescripcion').value,
        imagen: document.getElementById('productImagen').value || 'assets/images/productos/default.jpg'
    };
    
    if (id) {
        // Editar producto existente
        const index = productos.findIndex(p => p.id == id);
        productos[index] = { id: parseInt(id), ...nuevoProducto };
    } else {
        // Nuevo producto
        const newId = Math.max(...productos.map(p => p.id)) + 1;
        productos.push({ id: newId, ...nuevoProducto });
    }
    
    // Aquí normalmente guardarías en el servidor
    console.log('Producto guardado:', nuevoProducto);
    
    // Actualizar vista
    mostrarProductos();
    mostrarInventario();
    ocultarFormProducto();
    
    alert('Producto guardado exitosamente');
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    document.getElementById('productId').value = producto.id;
    document.getElementById('productNombre').value = producto.nombre;
    document.getElementById('productCategoria').value = producto.categoria;
    document.getElementById('productPrecio').value = producto.precio;
    document.getElementById('productBonos').value = producto.bonos || '';
    document.getElementById('productSku').value = producto.sku;
    document.getElementById('productStock').value = producto.stock;
    document.getElementById('productDescripcion').value = producto.descripcion || '';
    document.getElementById('productImagen').value = producto.imagen;
    
    document.getElementById('productForm').style.display = 'block';
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        mostrarProductos();
        mostrarInventario();
        alert('Producto eliminado');
    }
}

function mostrarInventario() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const row = `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.sku}</td>
                <td>
                    <input type="number" value="${producto.stock}" 
                           onchange="actualizarStock(${producto.id}, this.value)"
                           style="width: 60px;">
                </td>
                <td>
                    <input type="number" value="${producto.precio}" step="0.01"
                           onchange="actualizarPrecio(${producto.id}, this.value)"
                           style="width: 100px;">
                </td>
                <td>
                    <button onclick="editarProducto(${producto.id})">Editar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function actualizarStock(id, nuevoStock) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.stock = parseInt(nuevoStock);
        console.log(`Stock actualizado: ${producto.nombre} = ${nuevoStock}`);
    }
}

function actualizarPrecio(id, nuevoPrecio) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.precio = parseFloat(nuevoPrecio);
        console.log(`Precio actualizado: ${producto.nombre} = $${nuevoPrecio}`);
    }
}

// Función para cargar pedidos (ejemplo)
function cargarPedidos() {
    const ordersList = document.getElementById('orders-list');
    
    // Datos de ejemplo
    const pedidosEjemplo = [
        {
            id: 'PED-001',
            fecha: '2024-12-27',
            cliente: 'Juan Pérez',
            total: 1320.00,
            estado: 'Pendiente'
        },
        {
            id: 'PED-002',
            fecha: '2024-12-26',
            cliente: 'María Gómez',
            total: 2450.00,
            estado: 'Enviado'
        }
    ];
    
    pedidosEjemplo.forEach(pedido => {
        const orderCard = `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">${pedido.id}</span>
                    <span class="order-status ${pedido.estado.toLowerCase()}">${pedido.estado}</span>
                </div>
                <div class="order-body">
                    <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                    <p><strong>Fecha:</strong> ${pedido.fecha}</p>
                    <p><strong>Total:</strong> $${pedido.total.toFixed(2)}</p>
                </div>
                <div class="order-actions">
                    <button onclick="verDetallePedido('${pedido.id}')">Ver Detalle</button>
                    <button onclick="cambiarEstado('${pedido.id}')">Cambiar Estado</button>
                </div>
            </div>
        `;
        ordersList.innerHTML += orderCard;
    });
}

function verDetallePedido(id) {
    alert(`Mostrando detalle del pedido: ${id}`);
    // Aquí cargarías los detalles completos del pedido
}

function cambiarEstado(id) {
    const nuevoEstado = prompt(`Nuevo estado para pedido ${id}:`, "Enviado");
    if (nuevoEstado) {
        alert(`Pedido ${id} actualizado a: ${nuevoEstado}`);
    }
}