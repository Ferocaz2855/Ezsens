// Datos de productos
let productos = [];
let departamentos = [];

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDepartamentos();
    cargarProductosDestacados();
    actualizarCarrito();
    
    // Event listeners
    document.querySelector('.cart-icon').addEventListener('click', mostrarCarrito);
    document.querySelector('.close-modal').addEventListener('click', cerrarCarrito);
    document.querySelector('.close-checkout').addEventListener('click', cerrarCheckout);
    checkoutBtn.addEventListener('click', mostrarCheckout);
    checkoutForm.addEventListener('submit', procesarPedido);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cerrarCarrito();
        if (e.target === checkoutModal) cerrarCheckout();
    });
});

// Cargar departamentos de Perú
async function cargarDepartamentos() {
    try {
        const response = await fetch('assets/data/peru.json');
        const data = await response.json();
        departamentos = data.departamentos;
        llenarSelectDepartamentos();
    } catch (error) {
        console.error('Error cargando departamentos:', error);
        // Datos de respaldo
        departamentos = [
            {nombre: "Lima", distritos: ["Miraflores", "San Isidro", "La Molina", "Surco"]},
            {nombre: "Arequipa", distritos: ["Yanahuara", "Cayma", "Cerro Colorado"]},
            {nombre: "Cusco", distritos: ["Cusco", "San Sebastian", "San Jerónimo"]}
        ];
        llenarSelectDepartamentos();
    }
}

function llenarSelectDepartamentos() {
    const selectProvincia = document.getElementById('provincia');
    if (!selectProvincia) return;
    
    selectProvincia.innerHTML = '<option value="">Selecciona departamento</option>';
    
    departamentos.forEach(depto => {
        const option = document.createElement('option');
        option.value = depto.nombre;
        option.textContent = depto.nombre;
        selectProvincia.appendChild(option);
    });
    
    // Evento para cambiar distritos cuando se selecciona departamento
    selectProvincia.addEventListener('change', function() {
        const distritoSelect = document.getElementById('distrito');
        const selectedDepto = departamentos.find(d => d.nombre === this.value);
        
        if (selectedDepto && distritoSelect) {
            distritoSelect.innerHTML = '<option value="">Selecciona distrito</option>';
            selectedDepto.distritos.forEach(distrito => {
                const option = document.createElement('option');
                option.value = distrito;
                option.textContent = distrito;
                distritoSelect.appendChild(option);
            });
            
            // Cambiar el input de distrito por un select
            const distritoInput = document.querySelector('input[name="distrito"]');
            if (distritoInput) {
                distritoInput.replaceWith(distritoSelect);
            }
        }
    });
}

// Resto de funciones (manteniendo las anteriores)...
// [Aquí van las funciones anteriores que ya tenías: cargarProductosDestacados, agregarAlCarrito, etc.]

// Función actualizada para procesar pedido con envío a WhatsApp
function procesarPedido(e) {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const datosPedido = {
        fecha: new Date().toLocaleString('es-PE'),
        productos: carrito,
        total: carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0),
        cliente: Object.fromEntries(formData)
    };
    
    // Enviar a WhatsApp
    enviarWhatsApp(datosPedido);
    
    // Mostrar confirmación
    alert('¡Pedido realizado con éxito! Revisa WhatsApp para confirmar.');
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    cerrarCheckout();
    checkoutForm.reset();
}

// Función para enviar pedido a WhatsApp
function enviarWhatsApp(datosPedido) {
    const telefono = '51999888777'; // TU NÚMERO DE WHATSAPP (sin + ni espacios)
    
    // Formatear mensaje
    let mensaje = `🚀 *NUEVO PEDIDO EZSENS* 🚀\n\n`;
    mensaje += `📅 *Fecha:* ${datosPedido.fecha}\n`;
    mensaje += `🆔 *Pedido ID:* PED-${Date.now().toString().slice(-6)}\n\n`;
    
    mensaje += `👤 *CLIENTE*\n`;
    mensaje += `Nombre: ${datosPedido.cliente.nombre} ${datosPedido.cliente.apellido}\n`;
    mensaje += `WhatsApp: ${datosPedido.cliente.whatsapp}\n`;
    mensaje += `DNI/CE: ${datosPedido.cliente.dni}\n`;
    mensaje += `Ubicación: ${datosPedido.cliente.provincia}, ${datosPedido.cliente.distrito}\n`;
    mensaje += `Dirección: ${datosPedido.cliente.direccion}\n`;
    if (datosPedido.cliente.referencia) {
        mensaje += `Referencia: ${datosPedido.cliente.referencia}\n`;
    }
    
    mensaje += `\n🛒 *PRODUCTOS*\n`;
    datosPedido.productos.forEach(item => {
        mensaje += `• ${item.nombre}\n`;
        mensaje += `  Cantidad: ${item.cantidad}\n`;
        mensaje += `  Precio: $${item.precio.toFixed(2)}\n`;
        mensaje += `  Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });
    
    mensaje += `💰 *TOTAL:* $${datosPedido.total.toFixed(2)}\n\n`;
    mensaje += `✅ *ESTADO:* Pendiente de confirmación`;
    
    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear enlace de WhatsApp
    const whatsappURL = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappURL, '_blank');
    
    // También guardar en localStorage para respaldo
    guardarPedidoLocal(datosPedido);
}

// Función para guardar pedido en localStorage
function guardarPedidoLocal(pedido) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos_ezsens')) || [];
    pedido.id = `PED-${Date.now().toString().slice(-6)}`;
    pedidos.push(pedido);
    localStorage.setItem('pedidos_ezsens', JSON.stringify(pedidos));
}

// Función para mostrar notificaciones mejorada
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => notificacion.classList.add('show'), 10);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}