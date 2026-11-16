function doGet(e) {
  return ContentService.createTextOutput("Servidor CIDERE Biobío operativo.").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var tipoFormulario = e.parameter.tipoFormulario;
    
    // 1. REGISTRO DE CAPACIDADES (STARTUPS E IES)
    if (tipoFormulario === 'Capacidad' || tipoFormulario === 'Startup') {
      var sheet = doc.getSheetByName('Ecosistema Regional') || doc.insertSheet('Ecosistema Regional');
      var lastRow = sheet.getLastRow();
      var nextNum = 1;
      if (lastRow > 1) {
        var lastIdVal = sheet.getRange(lastRow, 1).getValue().toString();
        var match = lastIdVal.match(/PRY-(\d+)/i);
        nextNum = match ? parseInt(match[1], 10) + 1 : lastRow;
      }
      
      var nuevoId = "PRY-" + ("000" + nextNum).slice(-3);
      if (nextNum >= 1000) nuevoId = "PRY-" + nextNum;
      
      var tipoEntidad = (e.parameter.tipoEntidad || "Startup").trim();
      var institucion = (tipoEntidad.toUpperCase() === "IES") ? (e.parameter.institucion || "No especificada").trim() : ""; 
      var trl = e.parameter.trlActual ? e.parameter.trlActual.trim() : "Por validar";
      
      sheet.appendRow([
        nuevoId,
        e.parameter.nombreProyecto ? e.parameter.nombreProyecto.trim() : "",
        tipoEntidad,
        institucion,
        e.parameter.industria ? e.parameter.industria.trim() : "",
        e.parameter.queHace ? e.parameter.queHace.trim() : "",
        e.parameter.comoHace ? e.parameter.comoHace.trim() : "",
        trl,
        e.parameter.contactoEmail ? e.parameter.contactoEmail.trim() : "",
        "Pendiente"
      ]);
      
      return ContentService.createTextOutput("Capacidad registrada exitosamente").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 2. REGISTRO DE DESAFÍOS EN 'Desafios_Postulados' + RAZONAMIENTO SEMÁNTICO
    if (tipoFormulario === 'Desafio') {
      var sheetDesafios = doc.getSheetByName('Desafios_Postulados') || doc.insertSheet('Desafios_Postulados');
      var solicitanteNombre = e.parameter.solicitanteNombre ? e.parameter.solicitanteNombre.trim() : "No especificado";
      var empresa = e.parameter.empresa ? e.parameter.empresa.trim() : "";
      var contactoEmail = e.parameter.contactoEmail ? e.parameter.contactoEmail.trim() : "";
      var rubro = e.parameter.rubro ? e.parameter.rubro.trim() : "";
      var nivelRiesgo = e.parameter.nivelRiesgo ? e.parameter.nivelRiesgo.trim() : "No especificado";
      var titulo = e.parameter.titulo ? e.parameter.titulo.trim() : "";
      var descripcion = e.parameter.descripcion ? e.parameter.descripcion.trim() : "";
      var minTrl = parseInt(e.parameter.minTrlPermitido, 10) || 1;
      
      sheetDesafios.appendRow([
        new Date(),
        solicitanteNombre,
        empresa,
        contactoEmail,
        "Empresa",
        rubro,
        nivelRiesgo,
        titulo,
        descripcion,
        "Pendiente"
      ]);

      // Razonamiento semántico en servidor (requiere GEMINI_API_KEY en Propiedades del script)
      var matchesSemanticos = ejecutarMatchSemantico(doc, {
        empresa: empresa,
        rubro: rubro,
        titulo: titulo,
        descripcion: descripcion,
        minTrlPermitido: minTrl
      });

      var respuestaJson = JSON.stringify({
        status: "ok",
        mode: matchesSemanticos.length > 0 ? "semantic" : "local",
        matches: matchesSemanticos
      });
      
      return ContentService.createTextOutput(respuestaJson).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. REGISTRO DE CONTACTO EN 'Historial_Contactos'
    if (tipoFormulario === 'Contacto') {
      var sheetContacto = doc.getSheetByName('Historial_Contactos') || doc.insertSheet('Historial_Contactos');
      var solNombre = e.parameter.solicitanteNombre ? e.parameter.solicitanteNombre.trim() : "No especificado";
      var solEmpresa = e.parameter.solicitanteEmpresa ? e.parameter.solicitanteEmpresa.trim() : "Empresa o Usuario Web";
      var solEmail = e.parameter.solicitanteEmail ? e.parameter.solicitanteEmail.trim() : "No especificado";
      var nombreStartup = e.parameter.nombreStartup ? e.parameter.nombreStartup.trim() : "No especificado";
      var correoDestino = e.parameter.correoDestino ? e.parameter.correoDestino.trim() : "No especificado";
      var origen = e.parameter.origen ? e.parameter.origen.trim() : "Ficha Técnica";

      sheetContacto.appendRow([
        new Date(),
        solNombre,
        solEmpresa,
        solEmail,
        nombreStartup,
        correoDestino,
        origen,
        "Pendiente de contacto"
      ]);
      return ContentService.createTextOutput("Contacto registrado").setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ejecutarMatchSemantico(doc, datosDesafio) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) return [];

    var sheet = doc.getSheetByName('Ecosistema Regional');
    if (!sheet) return [];
    var rows = sheet.getDataRange().getValues();
    
    var catalogo = [];
    for (var i = 1; i < rows.length; i++) {
      var estado = (rows[i][9] || "").toString().trim();
      var trlRaw = (rows[i][7] || "").toString().trim();
      var trlMatch = trlRaw.match(/(\d)/);
      var trl = trlMatch ? parseInt(trlMatch[1], 10) : null;

      // Capacidades "Por validar" son admisibles en tolerancia alta/media, pero no en riesgo bajo (7-9)
      var cumpleTrl = (trl === null) ? (datosDesafio.minTrlPermitido <= 4) : (trl >= datosDesafio.minTrlPermitido);

      if (estado === "Aprobado" && cumpleTrl) {
        catalogo.push({
          nombre: rows[i][1],
          tipo: rows[i][2],
          institucion: rows[i][3],
          industria: rows[i][4],
          queHace: rows[i][5],
          comoHace: rows[i][6],
          trl: trlRaw
        });
      }
    }

    if (catalogo.length === 0) return [];

    var prompt = 
      "Eres el director de transferencia tecnológica de CIDERE Biobío.\n" +
      "Tu tarea es emparejar un DESAFÍO INDUSTRIAL con las CAPACIDADES REGIONALES (Startups y Universidades) que realmente puedan resolverlo.\n\n" +
      "REGLAS ESTRICTAS DE EVALUACIÓN:\n" +
      "1. NO emparejes solo porque compartan el mismo 'rubro' si su 'queHace' y 'comoHace' no resuelven el problema específico.\n" +
      "2. PRIORIZA el contraste técnico: verifica cómo el mecanismo descrito en 'comoHace' y la propuesta en 'queHace' atacan la causa raíz del problema.\n" +
      "3. VALORA la transferencia tecnológica intersectorial (ej: una solución de sensores en agroindustria puede resolver monitoreo térmico en alimentos o forestal).\n" +
      "4. Si ninguna capacidad del catálogo resuelve realmente el problema, devuelve una lista vacía [].\n\n" +
      "DESAFÍO INDUSTRIAL:\n" +
      "- Rubro solicitante: " + datosDesafio.rubro + "\n" +
      "- Título: " + datosDesafio.titulo + "\n" +
      "- Descripción del problema, entorno e impacto: " + datosDesafio.descripcion + "\n\n" +
      "CATÁLOGO DE CAPACIDADES DISPONIBLES:\n" + JSON.stringify(catalogo) + "\n\n" +
      "Devuelve ÚNICAMENTE un JSON válido con hasta 5 matches ordenados por afinidad real:\n" +
      "{ \"matches\": [ { \"nombre\": \"Nombre exacto en catálogo\", \"afinidad\": 94, \"justificacion\": \"Contraste técnico en 2 líneas explicando cómo su 'comoHace' y 'queHace' resuelven el problema específico\" } ] }";

    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    var payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, responseMimeType: "application/json" }
    };

    var response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) return [];

    var jsonResponse = JSON.parse(response.getContentText());
    var textoSalida = jsonResponse.candidates[0].content.parts[0].text;
    var parsed = JSON.parse(textoSalida);
    return parsed.matches || [];
  } catch (err) {
    return [];
  }
}
