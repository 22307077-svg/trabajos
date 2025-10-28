// main.js - registra SW y maneja permisos y envío de notificaciones
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => {
      console.log('Service Worker registrado con scope:', reg.scope);
    })
    .catch(err => console.error('Error al registrar SW:', err));
}

const askBtn = document.getElementById('askPermission');
const sendBtn = document.getElementById('sendNotification');
const clearBtn = document.getElementById('clearCache');

async function askPermission() {
  if (!('Notification' in window)) {
    alert('Este navegador no soporta Notificaciones.');
    return;
  }
  const result = await Notification.requestPermission();
  alert('Permiso: ' + result);
}

async function sendTestNotification() {
  if (!('serviceWorker' in navigator)) {
    alert('Service Worker no disponible.');
    return;
  }

  const permission = Notification.permission;
  if (permission !== 'granted') {
    alert('Por favor, primero permite notificaciones.');
    return;
  }

  const reg = await navigator.serviceWorker.getRegistration();
  const options = {
    body: '¡Hola, cuidemos el medio ambiente!',
    icon: 'logo.png',
    badge: 'logo.png',
    vibrate: [100, 50, 100],
    tag: 'sw4-minecraft-test',
    data: { url: 'index.html' }
  };

  if (reg && reg.showNotification) {
    reg.showNotification('global — Notificación', options);
  } else {
    // fallback (se puede mostrar una Notification desde la página)
    new Notification('global — Notificación', options);
  }
}

async function clearDynamicCache() {
  if (!('caches' in window)) { alert('No hay caches'); return; }
  const keys = await caches.keys();
  for(const k of keys){
    if(k.includes('sw4-dynamic')) await caches.delete(k);
  }
  alert('Caches dinámicos borrados.');
}

askBtn?.addEventListener('click', askPermission);
sendBtn?.addEventListener('click', sendTestNotification);
clearBtn?.addEventListener('click', clearDynamicCache);
