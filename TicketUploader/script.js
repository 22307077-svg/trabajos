// =============================================================================
// Uploader de Tickets - Versión actual (sube a la raíz del Drive del usuario autenticado)
// =============================================================================
// IMPORTANTE: Este flujo usa OAuth del usuario → los archivos se guardan en SU Drive,
// no en el tuyo. Para que todo vaya a TU cuenta sin pedir login a usuarios externos,
// necesitas un backend (recomendado: Google Apps Script o Node.js con Service Account).
// Si quieres esa versión, dime y te guío paso a paso (es más segura y centralizada).

// Configuración de Google API
const CLIENT_ID = '226515355841-dtqhafbqdsg51f6st993i30k3iepa49o.apps.googleusercontent.com';
const API_KEY = 'AIzaSyANr0IcvAguJcyhRzc2lPaU2wTTxZ8WXBs';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file'; // Permiso mínimo para crear archivos

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Inicializar Google API client
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Inicializar Google Identity Services (OAuth)
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Definido dinámicamente
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        const uploadBtn = document.getElementById('uploadButton');
        if (uploadBtn) uploadBtn.disabled = false;
    }
}

// Cargar librerías de Google
const script1 = document.createElement('script');
script1.src = 'https://accounts.google.com/gsi/client';
script1.async = true;
script1.defer = true;
script1.onload = gisLoaded;
document.body.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://apis.google.com/js/api.js';
script2.async = true;
script2.defer = true;
script2.onload = gapiLoaded;
document.body.appendChild(script2);

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');

// Vista previa de imagen
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        status.textContent = 'Foto lista para subir. ¡Dale al botón!';
        status.style.color = '#4ecdc4';
    }
});

// Evento de subida
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Selecciona o toma una foto primero.';
        status.style.color = '#ff6b6b';
        return;
    }

    // Nombre con fecha/hora
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `Ticket_${formattedDate}.${extension}`;

    status.textContent = 'Autenticando con Google...';
    status.style.color = '#ffd93d';

    // Solicitar token
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }

    tokenClient.callback = async (resp) => {
        if (resp.error) {
            status.textContent = 'Error al autenticar: ' + (resp.error_description || resp.error);
            status.style.color = '#ff6b6b';
            console.error('OAuth error:', resp);
            return;
        }
        await uploadFile(file, fileName);
    };
});

// Subida principal (a la raíz del Drive del usuario que autoriza)
async function uploadFile(file, fileName) {
    status.textContent = 'Subiendo evidencia a Google Drive...';
    status.style.color = '#4ecdc4';

    const metadata = {
        name: fileName,
        mimeType: file.type,
        // parents: ['TU_CARPETA_ID']  // Descomenta y pon ID si quieres carpeta específica
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + gapi.client.getToken().access_token
                },
                body: form,
            }
        );

        const result = await response.json();

        if (result.id) {
            status.innerHTML = '¡Evidencia subida exitosamente!<br>Guardada en la raíz de tu Google Drive.<br>(Si quieres que todo vaya a MI cuenta, necesitamos un backend – avísame)';
            status.style.color = '#6bc950';
            preview.style.display = 'none';
            fileInput.value = '';
        } else {
            status.textContent = 'Error de Drive: ' + (result.error?.message || JSON.stringify(result));
            status.style.color = '#ff6b6b';
            console.error('Respuesta Drive:', result);
        }
    } catch (error) {
        status.textContent = 'Error en la conexión: ' + error.message;
        status.style.color = '#ff6b6b';
        console.error('Error fetch:', error);
    }
}
