// =============================================================================
// Uploader de Tickets - Versión FINAL: Sube a TU Drive vía Google Apps Script
// =============================================================================
// Instrucciones rápidas:
// 1. Crea el Google Apps Script con el código doPost que te di antes
// 2. Despliégalo como Web App → Ejecutar como: Yo → Acceso: Cualquiera
// 3. Copia la URL que termina en /exec y pégala en SCRIPT_URL abajo
// 4. Sube este archivo a tu GitHub Pages y prueba

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwH6XeZlh2MP_o7y0uM0p0wTLp_-pcVi7dhjIrNMCssQvsVBekfW9TrRZzJ5VwMRtVvUw/exec';
// ↑↑↑ REEMPLAZA ESTA LÍNEA CON TU URL REAL DEL APPS SCRIPT (la que obtuviste al desplegar)

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');

// 1. Mostrar vista previa de la imagen al seleccionarla o tomarla
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        status.textContent = 'Foto lista para subir. Presiona "Subir a Google Drive"';
        status.style.color = '#4ecdc4';
    }
});

// 2. Evento al presionar el botón de subir
uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Primero selecciona o toma una foto.';
        status.style.color = '#ff6b6b';
        return;
    }

    status.textContent = 'Subiendo evidencia...';
    status.style.color = '#ffd93d';

    // Generar nombre del archivo con fecha y hora exacta
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `Ticket_${formattedDate}.${extension}`;

    // Leer el archivo como base64 para enviarlo al Apps Script
    const reader = new FileReader();
    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1];  // Solo la parte base64

        const formData = new FormData();
        formData.append('filename', fileName);
        formData.append('mimeType', file.type);
        formData.append('data', base64Data);  // El script lo recibe como e.postData.contents

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                redirect: 'follow',
                cache: 'no-cache'
            });

            // Si la respuesta no es OK (ej: 4xx o 5xx), lanzamos error
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                status.innerHTML = '¡Evidencia subida exitosamente!<br>Guardada en la carpeta del administrador.';
                status.style.color = '#6bc950';
                preview.style.display = 'none';
                fileInput.value = ''; // Limpia el input para la siguiente foto
            } else {
                status.textContent = 'Error desde el servidor: ' + (result.error || 'Respuesta desconocida');
                status.style.color = '#ff6b6b';
                console.error('Respuesta del script:', result);
            }
        } catch (err) {
            status.textContent = 'Error al conectar: ' + err.message;
            status.style.color = '#ff6b6b';
            console.error('Error completo en fetch:', err);
        }
    };

    reader.readAsDataURL(file);
});



