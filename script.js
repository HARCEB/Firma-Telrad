(function() {
    
    // ==========================================
    // 1. SELECCIÓN DE ELEMENTOS (Variables)
    // ==========================================
    
    // Inputs del formulario (donde escribe el usuario)
    var fields = {
        name: document.querySelector("input[name=name]"),
        role: document.querySelector("input[name=role]"),
        mobile: document.querySelector("input[name=mobile]"), // Sede / Dirección
        phone: document.querySelector("input[name=phone]"),   // Teléfono
    };

    // Celdas de las tablas (donde se muestra la info)
    var cells = {
        // --- Firma 1 (Diseño Nuevo) ---
        name1: document.getElementById("name-1"),
        role1: document.getElementById("role-1"),
        phone1: document.getElementById("phone-1"),
        mobile1: document.getElementById("mobile-1"),
        
        // --- Firma 2 (Diseño Clásico) ---
        name2: document.getElementById("name-2"),
        role2: document.getElementById("role-2"),
        phone2: document.getElementById("phone-2"),
        mobile2: document.getElementById("mobile-2")
    };

    // Elementos de la UI
    // NOTA: Asegúrate de que tu botón en el HTML ahora tenga el id "downloadBtn"
    var downloadBtn = document.getElementById("downloadBtn"); 
    var copyMessage = document.getElementById("copyMessage");
    var designSelector = document.getElementById("designSelect");

    // ==========================================
    // 6. LÓGICA DE QR Y DESCARGA (¡NUEVO!)
    // ==========================================

    // 6.1 Función para generar el texto vCard
    function generarVCard(nombre, cargo, telefono) {
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${nombre}\nORG:Telrad Perú S.A.\nTITLE:${cargo}\nTEL;WORK;VOICE:${telefono}\nEND:VCARD`;
    }

    // 6.2 Función para crear/actualizar el QR
    function actualizarQR() {
        // Obtenemos los valores actuales, si están vacíos usamos un valor por defecto para el QR
        var currentName = fields.name.value || 'Empleado Telrad';
        var currentRole = fields.role.value || 'Cargo';
        var currentPhone = fields.phone.value || '000000000';

        var vCardData = generarVCard(currentName, currentRole, currentPhone);
        
        // Verificamos qué firma está activa y actualizamos su contenedor QR
        var activeId = designSelector && designSelector.value === "signature2" ? "2" : "1";
        var qrContainerId = "qr-container-" + activeId;
        var qrContainer = document.getElementById(qrContainerId);

        // Si el contenedor existe en el HTML
        if (qrContainer) {
            // Limpiamos el QR anterior
            qrContainer.innerHTML = "";
            
            // Generamos el nuevo QR
            new QRCode(qrContainer, {
                text: vCardData,
                width: 80,
                height: 80,
                colorDark : "#005c96", // Azul corporativo
                colorLight : "#ffffff", // Fondo blanco
                correctLevel : QRCode.CorrectLevel.L // Nivel de corrección de error bajo para que se vea más limpio
            });
        }
    }

    // ==========================================
    // 2. FUNCIÓN DE ACTUALIZACIÓN (Rellena datos)
    // ==========================================
    function update() {
        // Valores por defecto (placeholder visual)
        var defaultName = "[Nombre y Apellido]";
        var defaultRole = "[Cargo]";
        var defaultPhone = "[Número]";
        var defaultMobile = "[Dirección]";

        // --- ACTUALIZAR FIRMA 1 ---
        if (cells.name1) cells.name1.innerHTML = fields.name.value || defaultName;
        if (cells.role1) cells.role1.innerHTML = fields.role.value || defaultRole;
        if (cells.phone1) cells.phone1.innerHTML = fields.phone.value || defaultPhone;
        if (cells.mobile1) cells.mobile1.innerHTML = fields.mobile.value || defaultMobile;

        // --- ACTUALIZAR FIRMA 2 ---
        if (cells.name2) cells.name2.innerHTML = fields.name.value || defaultName;
        if (cells.role2) cells.role2.innerHTML = fields.role.value || defaultRole;
        if (cells.phone2) cells.phone2.innerHTML = fields.phone.value || defaultPhone;
        if (cells.mobile2) cells.mobile2.innerHTML = fields.mobile.value || defaultMobile;

        // ¡AQUÍ LLAMAMOS A LA FUNCIÓN DEL QR CADA VEZ QUE SE ACTUALIZAN LOS DATOS!
        actualizarQR();
    }

    // ==========================================
    // 3. CAMBIAR DE DISEÑO (Dropdown)
    // ==========================================
    window.toggleSignature = function() {
        var selectedValue = designSelector.value;

        var sig1 = document.getElementById("signature1");
        var sig2 = document.getElementById("signature2");

        if (selectedValue === "signature1") {
            // Mostrar Firma 1
            if(sig1) sig1.style.display = "block";
            if(sig2) sig2.style.display = "none";
        } else {
            // Mostrar Firma 2
            if(sig1) sig1.style.display = "none";
            if(sig2) sig2.style.display = "block";
        }

        // Actualizamos el QR cuando se cambia de diseño para que se dibuje en el contenedor correcto
        actualizarQR();
    };

    // ==========================================
    // 4. LÓGICA DEL BOTÓN "DESCARGAR" (Reemplaza al de Copiar)
    // ==========================================
    if (downloadBtn) {
        downloadBtn.addEventListener("click", function() {
            
            // A. Identificar qué firma está activa
            var activeId = designSelector && designSelector.value === "signature1" ? "signature1" : "signature2";
            var activeSignature = document.getElementById(activeId);

            if (!activeSignature) return;

            // Cambiamos el texto del botón mientras procesa
            var originalText = downloadBtn.innerText;
            downloadBtn.innerText = "Generando imagen...";
            downloadBtn.style.backgroundColor = "#ccc"; // Gris mientras carga

            // B. Usamos html2canvas para tomar la "foto" de la tabla
            // Usamos un pequeño timeout para asegurar que el navegador haya renderizado el QR y los cambios antes de tomar la foto
            setTimeout(function() {
                html2canvas(activeSignature, {
                    backgroundColor: "#ffffff", // Forzar fondo blanco
                    scale: 2 // Aumentar la resolución de la imagen final para que se vea nítida
                }).then(canvas => {
                    // C. Crear un enlace temporal y forzar la descarga
                    var enlace = document.createElement('a');
                    
                    // Nombramos el archivo con el nombre del usuario si lo escribió, sino genérico
                    var fileNameName = fields.name.value ? fields.name.value.replace(/\s+/g, '_') : 'Firma';
                    enlace.download = fileNameName + '_Telrad.jpg';
                    
                    enlace.href = canvas.toDataURL('image/jpeg', 0.9); // Calidad 90%
                    enlace.click();

                    // D. Feedback visual al usuario
                    if(copyMessage) {
                        copyMessage.innerText = "¡Imagen descargada exitosamente!";
                        copyMessage.style.display = "block";
                    }
                    
                    // Restaurar botón después de 3 segundos
                    setTimeout(function() {
                        if(copyMessage) copyMessage.style.display = "none";
                        downloadBtn.innerText = "Descargar Firma (JPG)";
                        downloadBtn.style.backgroundColor = "#136899"; // Regresa al Azul
                    }, 3000);

                }).catch(err => {
                    console.error("Error al generar la imagen:", err);
                    alert("Hubo un problema al generar la imagen. Por favor intenta de nuevo.");
                    downloadBtn.innerText = "Descargar Firma (JPG)";
                    downloadBtn.style.backgroundColor = "#136899";
                });
            }, 300); // 300 milisegundos de espera
        });
    }

    // ==========================================
    // 5. INICIALIZACIÓN (Listeners)
    // ==========================================
    
    // Escuchar eventos de teclado en todos los inputs
    Object.values(fields).forEach(function(field) {
        if(field) {
            field.addEventListener("keyup", update);
            field.addEventListener("change", update);
        }
    });

    // Ejecutar una vez al cargar la página para limpiar/acomodar textos y generar el primer QR
    // Usamos un timeout inicial corto para dar tiempo a que la librería de QR se cargue si la conexión es lenta
    setTimeout(update, 500);

})();