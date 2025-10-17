// Registrar el service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((reg) => console.log('SW registrado', reg))
        .catch((err) => console.log('Error al registrar el SW', err));
}

// Botón para verificar el estado del SW
document.getElementById('check').addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
        alert('El SW está activo y controlando la página');
    } else {
        alert('El SW no está activo ');
    }
});

// Pedir permiso de notificación
if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
            console.log('Permiso de notificación concedido');
        } else {
            console.log('Permiso de notificación denegado');
        }
    });
}

// Botón para lanzar notificación
document.getElementById("btnNotificacion").addEventListener('click', async () => {
    const reg = await navigator.serviceWorker.ready;
    if (reg.active) {
        reg.active.postMessage({ action: 'mostrar-notificacion' });
    } else {
        console.log('El service Worker no está activo aún');
    }
});
