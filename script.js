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
        // Si tienes un campo de "office" u otro, agrégalo aquí
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

    // Elementos del botón de copiar
    var copyBtn = document.getElementById("copyBtn");
    var copyMessage = document.getElementById("copyMessage");
    var designSelector = document.getElementById("designSelect");

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
    }

    // ==========================================
    // 3. CAMBIAR DE DISEÑO (Dropdown)
    // ==========================================
    // Asignamos a window para que el HTML "onchange" la encuentre
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
    };

    // ==========================================
    // 4. LÓGICA DEL BOTÓN "COPIAR"
    // ==========================================
    if (copyBtn) {
        copyBtn.addEventListener("click", function() {
            
            // A. Identificar qué firma está activa según el selector
            // Si el valor es signature1, copiamos el div "signature1", si no, el "signature2"
            var activeId = designSelector.value === "signature1" ? "signature1" : "signature2";
            var activeSignature = document.getElementById(activeId);

            if (!activeSignature) return; // Seguridad por si falla algo

            // B. Crear un rango de selección (Simula seleccionar con el mouse)
            var range = document.createRange();
            range.selectNode(activeSignature);
            
            var selection = window.getSelection();
            selection.removeAllRanges(); // Limpiar selecciones previas
            selection.addRange(range);   // Seleccionar la firma

            try {
                // C. Ejecutar comando de copiado del navegador
                var successful = document.execCommand('copy');
                
                // D. Feedback visual al usuario
                if(successful) {
                    // Mostrar mensaje pequeño
                    if(copyMessage) copyMessage.style.display = "block";
                    
                    // Cambiar color y texto del botón
                    var originalText = copyBtn.innerText;
                    copyBtn.innerText = "¡Copiado!";
                    copyBtn.style.backgroundColor = "#8ec641"; // Verde Telrad
                    
                    // Restaurar botón después de 3 segundos
                    setTimeout(function() {
                        if(copyMessage) copyMessage.style.display = "none";
                        copyBtn.innerText = "Copiar Firma al Portapapeles";
                        copyBtn.style.backgroundColor = "#136899"; // Regresa al Azul
                    }, 3000);
                }
            } catch (err) {
                console.error('Error al intentar copiar automáticamente', err);
                alert("No se pudo copiar automáticamente. Por favor selecciona la firma con el mouse y presiona Ctrl+C.");
            }

            // E. Limpiar la selección visual (quitar el azul de fondo)
            selection.removeAllRanges();
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

    // Ejecutar una vez al cargar la página para limpiar/acomodar textos
    update();

})();