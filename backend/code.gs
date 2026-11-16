function doGet(e) {
  return ContentService.createTextOutput("Servidor CIDERE Biobío operativo.").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Neutraliza inyección de fórmulas en Google Sheets/Excel y limita longitud de campos.
 */
function sanitizarTexto(valor, maxLen) {
  if (valor === null || valor === undefined) return "";
  var limpio = valor.toString().trim();
  if (maxLen && limpio.length > maxLen) {
    limpio = limpio.substring(0, maxLen);
  }
  if (/^[=+\-@\t\r]/.test(limpio)) {
    limpio = "'" + limpio;
  }
  return limpio;
}

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Solicitud vacía" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. FILTRO HONEYPOT ANTI-BOTS (si el campo oculto viene con texto, se descarta en silencio)
    if (e.parameter.hp_website && e.parameter.hp_website.toString().trim() !== "") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        mode: "local",
        matches: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var tipoFormulario = sanitizarTexto(e.parameter.tipoFormulario, 40);
    var cache = CacheService.getScriptCache();

    // 2. LIMITADOR DE FRECUENCIA ANTI-SPAM (45 segundos entre envíos del mismo correo y formulario)
    var emailControl = (e.parameter.contactoEmail || e.parameter.solicitanteEmail || "").toString().toLowerCase().trim();
    if (emailControl) {
      var rlKey = "rl_" + tipoFormulario + "_" + emailControl.replace(/[^a-z0-9]/g, "");
      if (cache.get(rlKey)) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "rate_limited",
          mode: "local",
          matches: [],
          message: "Solicitud reciente detectada. Espera unos segundos antes de volver a enviar."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      cache.put(rlKey, "1", 45);
    }
    
    // 3. REGISTRO DE CAPACIDADES (STARTUPS E IES)
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
      
      var tipoEntidad = sanitizarTexto(e.parameter.tipoEntidad || "Startup", 30);
      var institucion = (tipoEntidad.toUpperCase() === "IES")
        ? sanitizarTexto(e.parameter.institucion || "No especificada", 150)
        : "";
      var trl = sanitizarTexto(e.parameter.trlActual || "Por validar", 40);
      
      sheet.appendRow([
        nuevoId,
        sanitizarTexto(e.parameter.nombreProyecto, 150),
        tipoEntidad,
        institucion,
        sanitizarTexto(e.parameter.industria, 80),
        sanitizarTexto(e.parameter.queHace, 1200),
        sanitizarTexto(e.parameter.comoHace, 1200),
        trl,
        sanitizarTexto(e.parameter.contactoEmail, 120),
        "Pendiente"
      ]);
      
      return ContentService.createTextOutput("Capacidad registrada exitosamente").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 4. REGISTRO DE DESAFÍOS EN 'Desafios_Postulados' + RAZONAMIENTO EN COLUMNA K
    if (tipoFormulario === 'Desafio') {
      var sheetDesafios = doc.getSheetByName('Desafios_Postulados') || doc.insertSheet('Desafios_Postulados');
      var fechaChile = Utilities.formatDate(new Date(), "America/Santiago", "dd/MM/yyyy HH:mm:ss");

      var solicitanteRaw = (e.parameter.solicitanteNombre || "No especificado").toString().trim().substring(0, 120);
      var empresaRaw = (e.parameter.empresa || "").toString().trim().substring(0, 150);
      var contactoRaw = (e.parameter.contactoEmail || "").toString().trim().substring(0, 120);
      var rubroRaw = (e.parameter.rubro || "").toString().trim().substring(0, 80);
      var riesgoRaw = (e.parameter.nivelRiesgo || "No especificado").toString().trim().substring(0, 60);
      var tituloRaw = (e.parameter.titulo || "").toString().trim().substring(0, 200);
      var descripcionRaw = (e.parameter.descripcion || "").toString().trim().substring(0, 2000);
      var minTrl = parseInt(e.parameter.minTrlPermitido, 10) || 1;

      var resultadoAgente = ejecutarMatchSemantico(doc, {
        empresa: empresaRaw,
        rubro: rubroRaw,
        titulo: tituloRaw,
        descripcion: descripcionRaw,
        minTrlPermitido: minTrl
      });

      var resumenAgente = "";
      if (resultadoAgente.matches.length > 0) {
        var listaTexto = resultadoAgente.matches.map(function(m, idx) {
          return (idx + 1) + ". " + m.nombre + " (" + m.afinidad + "%): " + m.justificacion;
        });
        resumenAgente = "[API Gemini] " + listaTexto.join(" | ");
      } else {
        resumenAgente = "[Motor Local] " + resultadoAgente.auditoria.detalle;
      }
      
      sheetDesafios.appendRow([
        fechaChile,
        sanitizarTexto(solicitanteRaw, 120),
        sanitizarTexto(empresaRaw, 150),
        sanitizarTexto(contactoRaw, 120),
        "Empresa",
        sanitizarTexto(rubroRaw, 80),
        sanitizarTexto(riesgoRaw, 60),
        sanitizarTexto(tituloRaw, 200),
        sanitizarTexto(descripcionRaw, 2000),
        "Pendiente",
        sanitizarTexto(resumenAgente, 2500)
      ]);

      var respuestaJson = JSON.stringify({
        status: "ok",
        mode: resultadoAgente.matches.length > 0 ? "semantic" : "local",
        matches: resultadoAgente.matches
      });
      
      return ContentService.createTextOutput(respuestaJson).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. REGISTRO DE CONTACTO EN 'Historial_Contactos'
    if (tipoFormulario === 'Contacto') {
      var sheetContacto = doc.getSheetByName('Historial_Contactos') || doc.insertSheet('Historial_Contactos');
      var fechaContactoChile = Utilities.formatDate(new Date(), "America/Santiago", "dd/MM/yyyy HH:mm:ss");

      sheetContacto.appendRow([
        fechaContactoChile,
        sanitizarTexto(e.parameter.solicitanteNombre || "No especificado", 120),
        sanitizarTexto(e.parameter.solicitanteEmpresa || "Empresa o Usuario Web", 150),
        sanitizarTexto(e.parameter.solicitanteEmail || "No especificado", 120),
        sanitizarTexto(e.parameter.nombreStartup || "No especificado", 150),
        sanitizarTexto(e.parameter.correoDestino || "No especificado", 120),
        sanitizarTexto(e.parameter.origen || "Ficha Técnica", 200),
        "Pendiente de contacto"
      ]);
      return ContentService.createTextOutput("Contacto registrado").setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Error interno del servidor" })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ejecutarMatchSemantico(doc, datosDesafio) {
  var auditoria = {
    detalle: ""
  };

  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      auditoria.detalle = "Propiedad GEMINI_API_KEY no configurada.";
      return { matches: [], auditoria: auditoria };
    }

    // Control preventivo de cuota diaria (máximo 80 evaluaciones IA por día)
    var cache = CacheService.getScriptCache();
    var hoyKey = "gemini_quota_" + Utilities.formatDate(new Date(), "America/Santiago", "yyyyMMdd");
    var conteoHoy = parseInt(cache.get(hoyKey) || "0", 10);
    if (conteoHoy >= 80) {
      auditoria.detalle = "Techo preventivo diario alcanzado (" + conteoHoy + "/80).";
      return { matches: [], auditoria: auditoria };
    }

    var sheet = doc.getSheetByName('Ecosistema Regional');
    if (!sheet) {
      auditoria.detalle = "Hoja 'Ecosistema Regional' no encontrada.";
      return { matches: [], auditoria: auditoria };
    }
    var rows = sheet.getDataRange().getValues();
    
    var catalogo = [];
    for (var i = 1; i < rows.length; i++) {
      var estado = (rows[i][9] || "").toString().trim();
      var trlRaw = (rows[i][7] || "").toString().trim();
      var trlMatch = trlRaw.match(/(\d)/);
      var trl = trlMatch ? parseInt(trlMatch[1], 10) : null;

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

    if (catalogo.length === 0) {
      auditoria.detalle = "Sin capacidades aprobadas sobre umbral TRL " + datosDesafio.minTrlPermitido + ".";
      return { matches: [], auditoria: auditoria };
    }

    cache.put(hoyKey, String(conteoHoy + 1), 86400);

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

    var codigoHttp = response.getResponseCode();
    if (codigoHttp !== 200) {
      auditoria.detalle = "Error HTTP " + codigoHttp + " al consultar Gemini.";
      return { matches: [], auditoria: auditoria };
    }

    var jsonResponse = JSON.parse(response.getContentText());
    var textoSalida = jsonResponse.candidates[0].content.parts[0].text;
    var parsed = JSON.parse(textoSalida);
    var listaMatches = parsed.matches || [];
    auditoria.detalle = "Evaluación semántica OK (" + listaMatches.length + " matches).";

    return { matches: listaMatches, auditoria: auditoria };
  } catch (err) {
    auditoria.detalle = "Excepción interna al evaluar.";
    return { matches: [], auditoria: auditoria };
  }
}
