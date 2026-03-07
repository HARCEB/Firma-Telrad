(function() {
    
    // 1. SELECCIÓN DE ELEMENTOS
    var fields = {
        name: document.querySelector("input[name=name]"),
        role: document.querySelector("input[name=role]"),
        mobile: document.querySelector("input[name=mobile]"),
        phone: document.querySelector("input[name=phone]")
    };

    var cells = {
        name1: document.getElementById("name-1"), role1: document.getElementById("role-1"),
        phone1: document.getElementById("phone-1"), mobile1: document.getElementById("mobile-1"),
        name2: document.getElementById("name-2"), role2: document.getElementById("role-2"),
        phone2: document.getElementById("phone-2"), mobile2: document.getElementById("mobile-2")
    };

    var downloadBtn = document.getElementById("downloadBtn"); 
    var copyBtn = document.getElementById("copyBtn");
    var copyMessage = document.getElementById("copyMessage");
    var designSelector = document.getElementById("designSelect");

    // 2. FUNCIÓN PARA LIMPIAR TILDES (NUEVO)
    function quitarTildes(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // 3. FUNCIÓN PARA DIBUJAR EL QR (CORREGIDA)
    function actualizarQR() {
        var currentName = fields.name.value || 'Empleado Telrad';
        var currentRole = fields.role.value || 'Cargo';
        var currentPhone = fields.phone.value || '000000000';

        // Limpiamos los textos de tildes o caracteres raros para evitar el 'overflow'
        var cleanName = quitarTildes(currentName);
        var cleanRole = quitarTildes(currentRole);
        
        // Generamos la vCard con los textos limpios (Nota: Puse Telrad Peru sin tilde)
        var vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${cleanName}\nORG:Telrad Peru S.A.\nTITLE:${cleanRole}\nTEL;WORK;VOICE:${currentPhone}\nEND:VCARD`;
        
        var activeId = designSelector && designSelector.value === "signature2" ? "2" : "1";
        var qrContainer = document.getElementById("qr-container-" + activeId);

        if (qrContainer) {
            qrContainer.innerHTML = ""; // Limpiar anterior
            
            try {
                // Dibujamos el QR con la información limpia
                new QRCode(qrContainer, {
                    text: vCardData, 
                    width: 80,
                    height: 80,
                    colorDark : "#005c96",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.L
                });
            } catch (error) {
                console.error("Error dibujando el QR:", error);
            }
        }
    }

    // 4. ACTUALIZAR TEXTOS MIENTRAS ESCRIBES
    function update() {
        var defaultName = "[Nombre y Apellido]";
        var defaultRole = "[Cargo]";
        var defaultPhone = "[Número]";
        var defaultMobile = "[Dirección]";

        if (cells.name1) cells.name1.innerHTML = fields.name.value || defaultName;
        if (cells.role1) cells.role1.innerHTML = fields.role.value || defaultRole;
        if (cells.phone1) cells.phone1.innerHTML = fields.phone.value || defaultPhone;
        if (cells.mobile1) cells.mobile1.innerHTML = fields.mobile.value || defaultMobile;

        if (cells.name2) cells.name2.innerHTML = fields.name.value || defaultName;
        if (cells.role2) cells.role2.innerHTML = fields.role.value || defaultRole;
        if (cells.phone2) cells.phone2.innerHTML = fields.phone.value || defaultPhone;
        if (cells.mobile2) cells.mobile2.innerHTML = fields.mobile.value || defaultMobile;

        actualizarQR(); // Llama al QR para que se actualice también
    }

    // 5. BOTÓN PARA DESCARGAR IMAGEN
    if (downloadBtn) {
        downloadBtn.addEventListener("click", function() {
            var activeId = designSelector && designSelector.value === "signature1" ? "signature1" : "signature2";
            var activeSignature = document.getElementById(activeId);

            if (!activeSignature) return;

            var originalText = downloadBtn.innerText;
            downloadBtn.innerText = "Generando imagen...";
            downloadBtn.style.backgroundColor = "#ccc";

            setTimeout(function() {
                html2canvas(activeSignature, {
                    backgroundColor: "#ffffff",
                    scale: 2 // Alta calidad
                }).then(canvas => {
                    var enlace = document.createElement('a');
                    var fileNameName = fields.name.value ? fields.name.value.replace(/\s+/g, '_') : 'Firma';
                    enlace.download = fileNameName + '_Telrad.jpg';
                    enlace.href = canvas.toDataURL('image/jpeg', 0.9);
                    enlace.click();

                    downloadBtn.innerText = "Descargar Firma (JPG)";
                    downloadBtn.style.backgroundColor = "#136899";
                }).catch(err => {
                    console.error("Error:", err);
                    downloadBtn.innerText = "Descargar Firma (JPG)";
                    downloadBtn.style.backgroundColor = "#136899";
                });
            }, 300);
        });
    }

    // 6. BOTÓN PARA COPIAR TEXTO (Mantenemos tu función original por si acaso)
    if (copyBtn) {
        copyBtn.addEventListener("click", function() {
            var activeId = designSelector && designSelector.value === "signature1" ? "signature1" : "signature2";
            var activeSignature = document.getElementById(activeId);
            if (!activeSignature) return;

            var range = document.createRange();
            range.selectNode(activeSignature);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range); 

            try {
                document.execCommand('copy');
                if(copyMessage) copyMessage.style.display = "block";
                copyBtn.innerText = "¡Copiado!";
                copyBtn.style.backgroundColor = "#8ec641"; 
                
                setTimeout(function() {
                    if(copyMessage) copyMessage.style.display = "none";
                    copyBtn.innerText = "Copiar tu firma";
                    copyBtn.style.backgroundColor = "#136899"; 
                }, 3000);
            } catch (err) {
                alert("Presiona Ctrl+C para copiar.");
            }
            selection.removeAllRanges();
        });
    }

    // 7. INICIAR TODO
    Object.values(fields).forEach(function(field) {
        if(field) {
            field.addEventListener("keyup", update);
            field.addEventListener("change", update);
        }
    });

    // Pequeño retraso al inicio para asegurar que la librería QR ya cargó
    setTimeout(update, 500);

    // 8. FUNCIÓN PARA CAMBIAR DE DISEÑO (Se te había borrado)
    window.toggleSignature = function() {
        var selectedValue = designSelector.value;
        var sig1 = document.getElementById("signature1");
        var sig2 = document.getElementById("signature2");

        if (selectedValue === "signature1") {
            if(sig1) sig1.style.display = "block";
            if(sig2) sig2.style.display = "none";
        } else {
            if(sig1) sig1.style.display = "none";
            if(sig2) sig2.style.display = "block";
        }
        // Actualizamos el QR si cambiamos de vista
        actualizarQR();
    };

})();