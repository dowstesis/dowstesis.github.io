// Empty JS for your own code to be here
var datos; // Variable global para almacenar los datos de la tabla
var datos2; // Variable global para almacenar los datos de la tabla
var filtrado = []; // Arreglo global para guardar los datos de los pozos candidatos
var xx = 0; // Variable global para dejar habilitados los botones (mostrar tabla - candidatos y reporte)
            // solo cuando se haya subido un archivo

window.onload = function() {
    // Se ejecuta automáticamente las recomendaciones al entrar a la página web
    recomendaciones();
}

// Deshabilitar los botones de reporte, candidatos y mostrar los datos del archivo seleccionado
// con el fin de que solo funcionen cuando se haya subido un archivo válido
var rep = document.getElementById("reporte");
rep.disabled = true;
var cand = document.getElementById("candidatos");
cand.disabled = true;
var dat = document.getElementById("datos");
dat.disabled = true;

// Función que muestra las recomendaciones más relevantes
function recomendaciones() {
    // se deshabilitan los botones solo cuando se refresca la web dado que el valor de xx vuelve a 0
    if (xx == 0) {
        var rep = document.getElementById("reporte");
        rep.disabled = true;
        var cand = document.getElementById("candidatos");
        cand.disabled = true;
        var dat = document.getElementById("datos");
        dat.disabled = true;
    }
    xx += 1;
    var rec = '<table class="sin-formato"><tr> <h1 class="text-center"> Recomendaciones</h1> </tr>'
    rec += '<tr><td><strong>1.</strong> La variable de Producción Total debe ser llamada: Prod Total (Bpd)</td></tr>'
    rec += '<tr><td><strong>2.</strong> La variable de Corte de Agua debe ser llamada: BS&W (%)</td></tr>'
    rec += '<tr><td><strong>3.</strong> La variable de Producción de Gas debe ser llamada: Prod Gas Anular (Kpcd)'
    rec += '<br><em>esto con fin de calcular el <strong>gas intake = Producción de Gas / Producción Total</strong></em></tr></td>'
    rec += '<tr><td><strong>4.</strong> La variable de grados API debe ser llamada: API</td></tr></table>'
    document.getElementById("contenido").innerHTML = rec;
}

// Función que permite establecer el botón para la subida del archivo de excel con los datos a filtrar
function subirArchivo() {
    var rep = document.getElementById("reporte");
    rep.disabled = true;
    var cand = document.getElementById("candidatos");
    cand.disabled = true;
    var dat = document.getElementById("datos");
    dat.disabled = true;
    var html = '<i class="fa fa-upload"></i> <input type="file" id="archivo" onclick="datosxls()"';
    html += 'class="file-upload-button" accept=".xls,.xlsx">';
    document.getElementById("contenido").innerHTML = html;
}

// Función que permite habilitar el botón de de mostrar datos cuando se haya subido el archivo de excel
function datosxls() {
    xx = 0;
    dat.disabled = false;
}

// Esta función permite mostrar la tabla de datos contenida en el archivo subido
function mostrarTabla() {
    if(xx === 0) {
        var archivo = document.getElementById("archivo").files[0];
        datos2 = archivo;
    }
    xx += 1;
    archivo = datos2;
    var lector = new FileReader();
    lector.readAsArrayBuffer(archivo);
    lector.onload = function (event) {
        var data = new Uint8Array(lector.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheet_name_list = workbook.SheetNames;
        var sheet = workbook.Sheets[sheet_name_list[0]];
        var html = XLSX.utils.sheet_to_html(sheet);
        document.getElementById("contenido").innerHTML = `<table>${html}</table>`; // Muestra la tabla de datos
        datos = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }); // Almacenar los datos de la tabla en la variable global
        cand.disabled = false; // Se habilita el botón de mostrar pozos candidatos
    }
}

// Función que permite filtrar los datos del archivo según las condiciones para la selección de pozos
function mostrarCandidatos() {
    rep.disabled = false; // Se habilita el botón de generar reporte con los datos filtrados
    filtrado[0] = new Array(datos[0].length);

    if (!datos) return alert('Los datos no se cargaron correctamente, intente de nuevo.'); // Verificar que se hayan cargado los datos de la tabla
    var html = '<table><tr id="encabezado">';
    for (var j = 0; j < datos[0].length; j++) {// Empezar desde la primer fila (la primera es el encabezado)
        filtrado[0][j] = datos[0][j];
        html += '<td>' + datos[0][j] + '</td>';
    }
    html += '</tr>';
    var t = 1;
    for (var i = 1; i < datos.length; i++) { // Empezar desde la segunda fila (la primera es el encabezado)
        html += '<tr>';
        var prodtotal = datos[i][datos[0].indexOf("Prod Total (Bpd)")];
        var bsw = parseFloat(datos[i][datos[0].indexOf("BS&W (%)")]);
        var api = datos[i][datos[0].indexOf("API")];
        var gas = datos[i][datos[0].indexOf("Prod Gas Anular (Kpcd)")];
        gas_intake = gas/prodtotal;
        // Verificar que producción total sea mayor a 1000 bbl/day
        // el corte de agua sea mayor al 60%, la gravedad API sea mayor a 16
        // y la entrada de gas sea menor al 2%
        if (prodtotal > 1000 && bsw > 0.6 && api > 16 && gas_intake < 0.02) { 
            filtrado[t] = new Array(datos[0].length);
            for (var k = 0; k < datos[0].length; k++) {
                filtrado[t][k] = datos[i][k];
                html += '<td>' + datos[i][k] + '</td>';
            }
            t += 1;
        }
        html += '</tr>';
    }
    html += '</table>';
    document.getElementById("contenido").innerHTML = html; // Mostrar la tabla con los daots filtrados
}

function generateReport() {
    // Crea un nuevo archivo de Excel
    var workbook = XLSX.utils.book_new();

    // Agrega los datos filtrados a una hoja del excel creado
    var worksheet = XLSX.utils.json_to_sheet(filtrado);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Genera y descarga el archivo de excel con nombre report
    XLSX.writeFile(workbook, "report.xlsx");
}

// Asigna la función de generar reporte al botón
//var button = document.getElementById("reporte");
//button.addEventListener("click", generateReport);