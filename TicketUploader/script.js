// Configuración de Google API
const CLIENT_ID = '226515355841-dtqhafbqdsg51f6st993i30k3iepa49o.apps.googleusercontent.com'; // Reemplaza con tu client_id de Google Cloud
const API_KEY = 'AIzaSyANr0IcvAguJcyhRzc2lPaU2wTTxZ8WXBs'; // Reemplaza con tu API key
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file'; // Solo para subir archivos

const CARPETA_ID = '1MbVs8n5xUrZvweKYnFgGzP9hzWVzma3g';


let tokenClient;
let gapiInited = false;
let gisInited = false;

// Inicializar Google API
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

// Inicializar Google Identity Services (para OAuth)
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
        document.getElementById('uploadButton').disabled = false;
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

// Lógica de la app
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Selecciona una imagen primero.';
        return;
    }

    // Capturar fecha y hora exacta
    const now = new Date();
    const formattedDate = now.toISOString().replace(/:/g, '-').slice(0, 19); // Ej: 2026-03-07T14-30-45 -> 2026-03-07-14-30-45
    const fileName = `Ticket_${formattedDate}.${file.name.split('.').pop()}`;

    // Autenticar y subir
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            status.textContent = 'Error en autenticación: ' + resp.error;
            return;
        }
        await uploadFile(file, fileName);
    };
});

async function uploadFile(file, fileName) {
    status.textContent = 'Subiendo...';

    const metadata = {
        name: fileName,
        mimeType: file.type,
        parents: [CARPETA_ID]  // ¡Ajuste clave! Sube a la carpeta específica
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
            method: 'POST',
            headers: new Headers({'Authorization': 'Bearer ' + gapi.client.getToken().access_token}),
            body: form,
        });
        const result = await response.json();
        if (result.id) {
            status.textContent = '¡Subido exitosamente! ID del archivo: ' + result.id;
            preview.style.display = 'none';
            fileInput.value = '';
        } else {
            status.textContent = 'Error: ' + JSON.stringify(result);
        }
    } catch (error) {
        status.textContent = 'Error en subida: ' + error.message;
    }
}


