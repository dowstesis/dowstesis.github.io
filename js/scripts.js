// Empty JS for your own code to be here
var datos; // Variable global para almacenar los datos de la tabla
var datos2;
var filtrado = [];
var xx = 0;

window.onload = function() {
    // Aquí puedes llamar a la función que quieres que se ejecute automáticamente
    recomendaciones();
}
var rep = document.getElementById("reporte");
rep.disabled = true;
var cand = document.getElementById("candidatos");
cand.disabled = true;
var dat = document.getElementById("datos");
dat.disabled = true;

function recomendaciones() {
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
    rec += '<tr><td>1. La variable de Producción Total debe ser llamada: Prod Total (Bpd)</td></tr>'
    rec += '<tr><td>2. La variable de Corte de Agua debe ser llamada: BS&W (%)</td></tr>'
    rec += '<tr><td>3. La variable de grados API debe ser llamada: API</td></tr></table>'
    document.getElementById("contenido").innerHTML = rec;
}

function subirArchivo() {
    var rep = document.getElementById("reporte");
    rep.disabled = true;
    var cand = document.getElementById("candidatos");
    cand.disabled = true;
    var dat = document.getElementById("datos");
    dat.disabled = true;

    document.getElementById("contenido").innerHTML = '<input type="file" id="archivo" onclick="boton()" class="file-upload-button" accept=".xls,.xlsx">';
}

function boton() {
    xx = 0;
    dat.disabled = false;
}

function mostrarTabla() {
    if(xx === 0) {
        var archivo = document.getElementById("archivo").files[0];
        datos2 = archivo;
    }
    xx += 1;
    archivo = datos2;
    console.log(archivo)
    var lector = new FileReader();
    lector.readAsArrayBuffer(archivo);
    lector.onload = function (event) {
        var data = new Uint8Array(lector.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheet_name_list = workbook.SheetNames;
        var sheet = workbook.Sheets[sheet_name_list[0]];
        var html = XLSX.utils.sheet_to_html(sheet);
        document.getElementById("contenido").innerHTML = `<table>${html}</table>`;
        datos = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }); // Almacenar los datos de la tabla en la variable global
        cand.disabled = false;
    }
}

function mostrarCandidatos() {
    rep.disabled = false;
    filtrado[0] = new Array(datos[0].length);

    if (!datos) return; // Verificar que se hayan cargado los datos de la tabla
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
        if (prodtotal > 1000 && bsw > 0.6 && api > 16) { // Verificar que PF sea mayor a 50
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
    document.getElementById("contenido").innerHTML = html;
}

function generateReport() {
    // Create new workbook
    var workbook = XLSX.utils.book_new();

    // Add worksheet with data
    var worksheet = XLSX.utils.json_to_sheet(filtrado);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate and download .xlsx file
    XLSX.writeFile(workbook, "report.xlsx");
}

// Attach event listener to button
var button = document.getElementById("reporte");
button.addEventListener("click", generateReport);