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
        callback: '', // Se define dinámicamente más abajo
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

// Cargar las librerías de Google automáticamente
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

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');

// Mostrar vista previa cuando se selecciona/toma foto
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// Evento al presionar "Subir"
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Primero selecciona o toma una foto.';
        status.style.color = '#ff6b6b';
        return;
    }

    // Generar nombre con fecha y hora exacta
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `Ticket_${formattedDate}.${extension}`;

    status.textContent = 'Autenticando...';
    status.style.color = '#ffd93d';

    // Solicitar token si no existe
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }

    // Callback después de obtener el token
    tokenClient.callback = async (resp) => {
        if (resp.error) {
            status.textContent = 'Error de autenticación: ' + resp.error;
            status.style.color = '#ff6b6b';
            console.error('OAuth error:', resp);
            return;
        }

        await uploadFile(file, fileName);
    };
});

// Función principal de subida a Google Drive (raíz de Mi unidad)
async function uploadFile(file, fileName) {
    status.textContent = 'Subiendo a Google Drive...';
    status.style.color = '#4ecdc4';

    const metadata = {
        name: fileName,
        mimeType: file.type,
        // parents: [...]  ← Comentado intencionalmente para subir a la raíz
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
        console.log('Iniciando subida del archivo:', fileName); // Para depuración

        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
            {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + gapi.client.getToken().access_token
                }),
                body: form,
            }
        );

        const result = await response.json();

        if (result.id) {
            status.textContent = '¡Subido exitosamente! Archivo guardado en la raíz de tu Google Drive.';
            status.style.color = '#6bc950';
            preview.style.display = 'none';
            fileInput.value = ''; // Limpia el input para la siguiente foto
        } else {
            status.textContent = 'Error en la respuesta de Drive: ' + JSON.stringify(result);
            status.style.color = '#ff6b6b';
            console.error('Respuesta de Drive:', result);
        }
    } catch (error) {
        status.textContent = 'Error durante la subida: ' + error.message;
        status.style.color = '#ff6b6b';
        console.error('Error completo:', error);
    }
}
