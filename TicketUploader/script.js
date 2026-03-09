// script.js - Sube directamente al Google Apps Script (guarda en TU Drive)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4ZmQNQrASNgwPZoX83mx9gqSG5a9NPSgZQ51na9s-XKcgastrTWUry3b1DPvlZ5lo/exec';  // ← Pega aquí la URL de tu Web App del Paso 3

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');

// Mostrar vista previa
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        status.textContent = 'Foto lista. ¡Presiona "Subir a Google Drive"!';
        status.style.color = '#4ecdc4';
    }
});

// Subida al script
uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Primero selecciona o toma una foto.';
        status.style.color = '#ff6b6b';
        return;
    }

    status.textContent = 'Subiendo evidencia...';
    status.style.color = '#ffd93d';

    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `Ticket_${formattedDate}.${extension}`;

    const reader = new FileReader();
    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1];  // Base64 puro

        const formData = new FormData();
        formData.append('filename', fileName);
        formData.append('mimeType', file.type);
        formData.append('data', base64Data);

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                redirect: 'follow'
            });

            const result = await response.json();

            if (result.success) {
                status.innerHTML = '¡Evidencia subida exitosamente!<br>Guardada en la carpeta del administrador.';
                status.style.color = '#6bc950';
                preview.style.display = 'none';
                fileInput.value = '';
            } else {
                status.textContent = 'Error: ' + (result.error || 'Respuesta desconocida');
                status.style.color = '#ff6b6b';
            }
        } catch (err) {
            status.textContent = 'Error al conectar: ' + err.message;
            status.style.color = '#ff6b6b';
        }
    };

    reader.readAsDataURL(file);
});


