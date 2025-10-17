//verificar si el navegador web soporta service workers
if ("serviceWorker" in navigator) {
    
    //llamar el metodo register para registrar un SW
    //el parametro /sw.js es la ruta del archivo del sw
    navigator.serviceWorker
        .register("./sw.js")

        //then se ejecuta sin registro fue exitoso
        //reg es un objeto tipo serviceworkerregistration con informacion del sw
        .then((reg)=> console.log("Service Worker registrado:", reg))
        //catch se ejecuta si ocurre un error en el registro
        //err contiene el mensaje o detalle del error
        .catch((error) => console.log("Error al registrar el SW:", err));

}
//Agregamos un evento clic al boton check
document.getElementById("check").addEventListener("click", () =>
{
    //verificar si el sw controla la paguina actual\
    if (navigator.serviceWorker.controller) {
        alert("el service worker esta activado y controlando la paguina.");
    }else{
        alert("el service worker aun no esta activado");
    }
});

//area de notificacion
if (Notification.permission ==="default") {
    Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
            console.log("Permiso de Notificacion concedido.");
        }
    });
}