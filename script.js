(function() {
    
    // 1. SELECCIÓN DE ELEMENTOS
    var fields = {
        name: document.querySelector("input[name=name]"),
        role: document.querySelector("input[name=role]"),
        mobile: document.querySelector("input[name=mobile]"),
        phone: document.querySelector("input[name=phone]"),
        email: document.querySelector("input[name=email]") // Nuevo campo de correo
    };

    var cells = {
        name1: document.getElementById("name-1"), role1: document.getElementById("role-1"),
        phone1: document.getElementById("phone-1"), mobile1: document.getElementById("mobile-1"),
        name2: document.getElementById("name-2"), role2: document.getElementById("role-2"),
        phone2: document.getElementById("phone-2"), mobile2: document.getElementById("mobile-2")
    };

    var downloadBtn = document.getElementById("downloadBtn"); 
    var designSelector = document.getElementById("designSelect");

    // 2. FUNCIÓN PARA LIMPIAR TILDES
    function quitarTildes(texto) {
        if (!texto) return "";
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // 3. FUNCIÓN PARA DIBUJAR EL QR EN ALTA DEFINICIÓN
    function actualizarQR() {
        var currentName = fields.name.value || 'Empleado Telrad';
        var currentRole = fields.role.value || 'Telrad Peru S.A.';
        var currentEmail = fields.email.value || 'contacto@telrad.com.pe';
        var currentAddress = fields.mobile.value || 'Lima, Peru';
        
        var rawPhone = fields.phone.value || '000000000';
        var currentPhone = rawPhone.includes('+51') ? rawPhone : '+51 ' + rawPhone.trim();

        var cleanName = quitarTildes(currentName);
        var cleanRole = quitarTildes(currentRole);
        var cleanAddress = quitarTildes(currentAddress);
        var cleanEmail = quitarTildes(currentEmail);

        var vCardData = `BEGIN:VCARD\nVERSION:3.0\nN:;${cleanName};;;\nFN:${cleanName}\nORG:Telrad Peru S.A.\nTITLE:${cleanRole}\nTEL;WORK;VOICE:${currentPhone}\nEMAIL;WORK;INTERNET:${cleanEmail}\nADR;WORK:;;${cleanAddress}\nEND:VCARD`;
        
        var activeId = designSelector && designSelector.value === "signature2" ? "2" : "1";
        var qrContainer = document.getElementById("qr-container-" + activeId);

        if (qrContainer) {
            qrContainer.innerHTML = ""; 
            try {
                new QRCode(qrContainer, {
                    text: vCardData, 
                    width: 250,   // GENERADO EN ALTA CALIDAD
                    height: 250,  // GENERADO EN ALTA CALIDAD
                    colorDark : "#005c96",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.M // Nivel medio para soportar más data
                });

                // Truco CSS: Encogemos la imagen HD para que quepa en tu caja de 70x70
                setTimeout(function() {
                    var canvas = qrContainer.querySelector("canvas");
                    var img = qrContainer.querySelector("img");
                    if (canvas) {
                        canvas.style.width = "100%";
                        canvas.style.height = "100%";
                    }
                    if (img) {
                        img.style.width = "100%";
                        img.style.height = "100%";
                    }
                }, 50);

            } catch (error) {
                console.error("Error dibujando el QR:", error);
            }
        }
    }

    // 4. ACTUALIZAR TEXTOS VISIBLES MIENTRAS ESCRIBES
    function update() {
        // Restauramos los textos con corchetes
        var defaultName = "[Nombre y Apellido]";
        var defaultRole = "[Cargo]";
        var defaultMobile = "[Dirección]";
        var defaultPhone = "[Número]";

        var rawPhone = fields.phone.value;
        var displayPhone = rawPhone ? (rawPhone.includes('+51') ? rawPhone : '+51 ' + rawPhone.trim()) : defaultPhone;

        if (cells.name1) cells.name1.innerHTML = fields.name.value || defaultName;
        if (cells.role1) cells.role1.innerHTML = fields.role.value || defaultRole;
        if (cells.phone1) cells.phone1.innerHTML = displayPhone;
        if (cells.mobile1) cells.mobile1.innerHTML = fields.mobile.value || defaultMobile;

        if (cells.name2) cells.name2.innerHTML = fields.name.value || defaultName;
        if (cells.role2) cells.role2.innerHTML = fields.role.value || defaultRole;
        if (cells.phone2) cells.phone2.innerHTML = displayPhone;
        if (cells.mobile2) cells.mobile2.innerHTML = fields.mobile.value || defaultMobile;

        actualizarQR(); 
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
                    scale: 2 
                }).then(canvas => {
                    var enlace = document.createElement('a');
                    var fileNameName = fields.name.value ? fields.name.value.replace(/\s+/g, '_') : 'Firma_Telrad';
                    enlace.download = fileNameName + '.jpg';
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

    // 6. CAMBIO DE DISEÑO
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
        actualizarQR();
    };

    // 7. INICIAR TODO
    Object.values(fields).forEach(function(field) {
        if(field) {
            field.addEventListener("keyup", update);
            field.addEventListener("change", update);
        }
    });

    setTimeout(update, 500);

})();