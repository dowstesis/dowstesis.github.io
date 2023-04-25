// Empty JS for your own code to be here
var datos; // Variable global para almacenar los datos de la tabla
var datos2; // Variable global para almacenar los datos de la tabla
var filtrado = []; // Arreglo global para guardar los datos de los pozos candidatos
var xx = 0; // Variable global para dejar habilitados los botones (mostrar tabla - candidatos y reporte)
// solo cuando se haya subido un archivo


window.onload = function () {
    // Se ejecuta automáticamente las recomendaciones al entrar a la página web
    recomendaciones();
}

// Deshabilitar los botones de reporte, candidatos, mostrar los datos y beneficio del archivo seleccionado
// con el fin de que solo funcionen cuando se haya subido un archivo válido
var rep = document.getElementById("reporte");
rep.disabled = true;
var cand = document.getElementById("candidatos");
cand.disabled = true;
var dat = document.getElementById("datos");
dat.disabled = true;
var ben = document.getElementById("beneficio");
ben.disabled = true;

// Función que muestra las recomendaciones más relevantes
function recomendaciones() {
    // se deshabilitan los botones solo cuando se refresca la web dado que el valor de xx vuelve a 0
    if (xx == 0) {
        rep.disabled = true;
        cand.disabled = true;
        dat.disabled = true;
        ben.disabled = true;
    }
    xx += 1;
    var rec = '<div class="main"><h1 class="text-center"> Recomendaciones</h1>'
    rec += '<div class="rec"><strong>1.</strong> El archivo que contiene los datos debe estar en formato .xls o .xlsx'
    rec += '<br><strong>2.</strong> Los datos de los pozos deben estar en la primer hoja del archivo subido'
    rec += '<br><strong>3.</strong> La variable de Producción Total debe ser llamada: Prod Total (Bpd)'
    rec += '<br><strong>4.</strong> La variable de Corte de Agua debe ser llamada: BS&W (%)'
    rec += '<br><strong>5.</strong> La variable de Producción de Gas debe ser llamada: Prod Gas Anular (Kpcd)'
    rec += '<br><em>esto con fin de calcular el <strong>gas intake = Producción de Gas / Producción Total</strong></em>'
    rec += '<br><strong>6.</strong> La variable de grados API debe ser llamada: API</div></div>'
    document.getElementById("contenido").innerHTML = rec;
}

// Función que permite establecer el botón para la subida del archivo de excel con los datos a filtrar
function subirArchivo() {
    rep.disabled = true;
    cand.disabled = true;
    dat.disabled = true;
    ben.disabled = true;
    var html = '<div class="upload"><input type="file" id="archivo" onclick="datosxls()"';
    html += 'class="file-upload-button" accept=".xls,.xlsx"></div>';
    document.getElementById("contenido").innerHTML = html;
}

// Función que permite habilitar el botón de de mostrar datos cuando se haya subido el archivo de excel
function datosxls() {
    xx = 0;
    dat.disabled = false;
}

// Esta función permite mostrar la tabla de datos contenida en el archivo subido
function mostrarTabla() {
    if (xx === 0) {
        //escoge el archivo subido y lo guarda en la variable archivo
        var archivo = document.getElementById("archivo").files[0];
        datos2 = archivo;
    }
    xx += 1;
    archivo = datos2;
    //permite la lectura de los datos desde el archivo de excel
    var lector = new FileReader();
    lector.readAsArrayBuffer(archivo);
    lector.onload = function (event) {
        var data = new Uint8Array(lector.result);
        var workbook = XLSX.read(data, {
            type: 'array'
        });
        var sheet_name_list = workbook.SheetNames;
        var sheet = workbook.Sheets[sheet_name_list[0]];
        var html = XLSX.utils.sheet_to_html(sheet);
        // Almacenar los datos de la tabla en la variable global datos
        datos = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false
        }); 

        // Verificar que se hayan cargado los datos de la tabla
        if (!datos) return alert('Los datos no se cargaron correctamente, intente de nuevo.'); 

        //muestra el encabezado de los datos proporcionados en el excel
        var html2 = '<div class="table"><table><tr>';
        for (let j = 0; j < datos[0].length; j++) { // Empezar desde la primer fila (la primera es el encabezado)
            html2 += '<th>' + datos[0][j] + '</th>';
        }
        html2 += '</tr>';
        //muestra cada uno de los datos correspondiente a los pozos
        for (let i = 1; i < datos.length; i++) { // Empezar desde la segunda fila (la primera es el encabezado)
            html2 += '<tr>';
            for (var k = 0; k < datos[0].length; k++) {
                if (datos[i][k] === undefined) {
                    html2 += '<td>' + '-' + '</td>';
                } else {
                    html2 += '<td>' + datos[i][k] + '</td>';
                }
            }
            html2 += '</tr>';
        }
        html2 += '</table></div>';
        document.getElementById("contenido").innerHTML = html2; // Mostrar la tabla completa
        cand.disabled = false; // Se habilita el botón de candidatos para poder filtrar la tabla
    }
}

// Función que permite filtrar los datos del archivo según las condiciones para la selección de pozos
function mostrarCandidatos() {
    rep.disabled = false; // Se habilita el botón de generar reporte con los datos filtrados
    ben.disabled = false; // Se habilita el botón de beneficio esperado con los datos filtrados
    filtrado[0] = new Array(datos[0].length);

    // Verificar que se hayan cargado los datos de la tabla

    if (!datos) return alert('Los datos no se cargaron correctamente, intente de nuevo.'); 
    var html = '<div class="table"><table><tr>';
    for (let j = 0; j < datos[0].length; j++) { // Empezar desde la primer fila (la primera es el encabezado)
        filtrado[0][j] = datos[0][j];
        html += '<th>' + datos[0][j] + '</th>';
    }
    html += '</tr>';
    var t = 1;
    for (let i = 1; i < datos.length; i++) { // Empezar desde la segunda fila (la primera es el encabezado)
        html += '<tr>';
        //se toma el dato correspondiente a la columna especificada, sea prod total, api, etc.
        var prodtotal = datos[i][datos[0].indexOf("Prod Total (Bpd)")];
        var bsw = parseFloat(datos[i][datos[0].indexOf("BS&W (%)")]);
        var api = datos[i][datos[0].indexOf("API")];
        var gas = datos[i][datos[0].indexOf("Prod Gas Anular (Kpcd)")];
        gas_intake = gas / prodtotal;
        // Verificar que producción total sea mayor a 500 bbl/day
        // el corte de agua sea mayor al 60%, la gravedad API sea mayor a 16
        // y la entrada de gas sea menor al 2%
        if (prodtotal > 500 && bsw > 0.6 && api > 16 && gas_intake < 0.02 && prodtotal < 20000) {
            filtrado[t] = new Array(datos[0].length);
            for (var k = 0; k < datos[0].length; k++) {
                filtrado[t][k] = datos[i][k];
                html += '<td>' + datos[i][k] + '</td>';
            }
            t += 1;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    document.getElementById("contenido").innerHTML = html; // Mostrar la tabla con los datos filtrados
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

function beneficioEsperado() {
    var benEsp = '<div class="form"><label>Precio del Crudo: [$] </label> <input type="number" class="costo-crudo" placeholder="78.68" >';
    benEsp += '<br><label>Barriles adicionales de crudo a producir: [STB/D] </label> <input type="number" class="barr-crudo" disabled>';
    benEsp += '<br><label>Barriles acumulados de agua inyectada: [STB/D] </label> <input type="number" class="barr-agua" disabled>';
    benEsp += '<br><label>Costo diario de operación: [$/D] </label> <input type="number" class="costo-oper" placeholder="1000">';
    benEsp += '<br><label>Costo de la disposición final del agua: [$/bbl] </label> <input type="number" class="costo-dispw" placeholder="2.25">';
    benEsp += '<br><label>Costo tratamiento del agua: [$/bbl] </label> <input type="number" class="costo-tratw" placeholder="10-32">';
    benEsp += '<br><label>Costo levantamiento del agua: [$/bbl] </label> <input type="number" class="costo-levw" placeholder="8-20">';
    benEsp += '<br><label>Impuestos por producción: [%] </label> <input type="number" class="impuesto" placeholder="10-20">';
    benEsp += '<br><label for="opciones">Seleccione el tipo de pronóstico deseado: </label><select name="opciones" id="opciones">';
    benEsp += '<option value="optimista">Optimista</option><option value="neutral">Neutral</option><option value="pesimista">Pesimista</option></select>';
    benEsp += '<br><button class="button beneficio" onclick="benefEsperado()">Calcular beneficio</button>';
    benEsp += '<div id="resultado"></div></div>';
    document.getElementById("contenido").innerHTML = benEsp;
}

function benefEsperado() {
    var costoCrudo = parseFloat(document.querySelector(".costo-crudo").value);
    var barrCrudo = document.querySelector(".barr-crudo");
    var barrAgua = document.querySelector(".barr-agua");
    var costoDispW = parseFloat(document.querySelector(".costo-dispw").value);
    var costoTratW = parseFloat(document.querySelector(".costo-tratw").value);
    var costoLevW = parseFloat(document.querySelector(".costo-levw").value);
    var impuesto = parseFloat(document.querySelector(".impuesto").value);
    var cost_dia = parseFloat(document.querySelector(".costo-oper").value);

    if (isNaN(costoCrudo) || isNaN(cost_dia) || isNaN(costoDispW) || isNaN(costoTratW) || isNaN(costoLevW) || isNaN(impuesto)) {
        document.getElementById("resultado").innerHTML = "Hay espacios en blanco.";
    } else {

        var prod_crudo_dia = 0;
        var prod_agua_dia = 0;

        for (let i = 1; i < filtrado.length; i++) { // Empezar desde la segunda fila (la primera es el encabezado)
            let prodtotal = filtrado[i][filtrado[0].indexOf("Prod Total (Bpd)")];
            let bsw = parseFloat(filtrado[i][filtrado[0].indexOf("BS&W (%)")]);

            prod_crudo = prodtotal * (1 - bsw / 100);
            prod_agua = prodtotal * bsw / 100;

            prod_crudo_dia += prod_crudo;
            prod_agua_dia += prod_agua;
        }

        var pronostico = document.querySelector("#opciones").value;

        if (pronostico == "optimista") {

            //el aumento de la producción de crudo se estimará en un 70%
            let prod_crudo_nueva = 1.7 * prod_crudo_dia;
            //la reducción de agua se estima en un 80%
            let prod_agua_nueva = prod_agua_dia * 0.2;
            red_agua = prod_agua_dia - prod_agua_nueva;
            //nuevo bsw luego del aumento del crudo y disminución del agua producida
            bsw_despues_dows = 100 * prod_agua_nueva / (prod_crudo_nueva + prod_agua_nueva);


            //producción adicional de crudo:
            adic_crudo = prod_crudo_nueva - prod_crudo_dia;

            //beneficio por la producción adicional de crudo
            bef_crudo = adic_crudo * costoCrudo;
            tax = bef_crudo * impuesto / 100;
            disp_agua = red_agua * (costoDispW + costoLevW + costoTratW);

            //beneficio esperado usando la ecuación de Johkio
            benef_esperado = bef_crudo + disp_agua - tax - cost_dia;

            //los valores estimados de producción de crudo adicional y de agua al final
            barrCrudo.value = Math.round(adic_crudo);
            barrAgua.value = Math.round(red_agua);

            let html = `Si la producción aumenta 70% y el corte de agua se reduce 80%, el BSW nuevo será de ${Math.round(bsw_despues_dows)}%,`;
            html += ` además, el beneficio esperado será de $${Math.round(benef_esperado)} /D`;
            document.getElementById("resultado").innerHTML = html;

        } else if (pronostico == "neutral") {

            //el aumento de la producción de crudo se estimará en un 50%
            let prod_crudo_nueva = 1.5 * prod_crudo_dia;
            //la reducción de agua se estima en un 50%
            let prod_agua_nueva = prod_agua_dia * 0.5;
            red_agua = prod_agua_dia - prod_agua_nueva;
            //nuevo bsw luego del aumento del crudo y disminución del agua producida
            bsw_despues_dows = 100 * prod_agua_nueva / (prod_crudo_nueva + prod_agua_nueva);


            //producción adicional de crudo:
            adic_crudo = prod_crudo_nueva - prod_crudo_dia;

            console.log(adic_crudo)

            //beneficio por la producción adicional de crudo
            bef_crudo = adic_crudo * costoCrudo;
            tax = bef_crudo * impuesto / 100;
            disp_agua = red_agua * (costoDispW + costoLevW + costoTratW);

            //beneficio esperado usando la ecuación de Johkio
            benef_esperado = bef_crudo + disp_agua - tax - cost_dia;

            //los valores estimados de producción de crudo adicional y de agua al final
            barrCrudo.value = Math.round(adic_crudo);
            barrAgua.value = Math.round(red_agua);

            let html = `Si la producción aumenta 50% y el corte de agua se reduce 50%, el BSW nuevo será de ${Math.round(bsw_despues_dows)}%,`;
            html += ` además, el beneficio esperado será de $${Math.round(benef_esperado)} /D`;
            document.getElementById("resultado").innerHTML = html;

        } else {

            //el aumento de la producción de crudo se estimará en un 20%
            let prod_crudo_nueva = 1.2 * prod_crudo_dia;
            //la reducción de agua se estima en un 20%
            let prod_agua_nueva = prod_agua_dia * 0.8;
            red_agua = prod_agua_dia - prod_agua_nueva;
            //nuevo bsw luego del aumento del crudo y disminución del agua producida
            bsw_despues_dows = 100 * prod_agua_nueva / (prod_crudo_nueva + prod_agua_nueva);


            //producción adicional de crudo:
            adic_crudo = prod_crudo_nueva - prod_crudo_dia;

            //beneficio por la producción adicional de crudo
            bef_crudo = adic_crudo * costoCrudo;
            tax = bef_crudo * impuesto / 100;
            disp_agua = red_agua * (costoDispW + costoLevW + costoTratW);

            //beneficio esperado usando la ecuación de Johkio
            benef_esperado = bef_crudo + disp_agua - tax - cost_dia;

            //los valores estimados de producción de crudo adicional y de agua al final
            barrCrudo.value = Math.round(adic_crudo);
            barrAgua.value = Math.round(red_agua);

            let html = `Si la producción aumenta 30% y el corte de agua se reduce 20%, el BSW nuevo será de ${Math.round(bsw_despues_dows)}%,`;
            html += ` además, el beneficio esperado será de $${Math.round(benef_esperado)} /D`;
            document.getElementById("resultado").innerHTML = html;

        }


    }
}