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
    
    // 2. REGISTRO DE DESAFÍOS
    if (tipoFormulario === 'Desafio') {
      var sheetDesafios = doc.getSheetByName('Desafios Mesa Innovacion') || doc.getSheetByName('Desafios_Postulados') || doc.insertSheet('Desafios_Postulados');
      sheetDesafios.appendRow([
        new Date(),
        e.parameter.empresa ? e.parameter.empresa.trim() : "",
        e.parameter.contactoEmail ? e.parameter.contactoEmail.trim() : "",
        "Empresa",
        e.parameter.rubro ? e.parameter.rubro.trim() : "",
        e.parameter.titulo ? e.parameter.titulo.trim() : "",
        e.parameter.descripcion ? e.parameter.descripcion.trim() : "",
        "Pendiente"
      ]);
      
      return ContentService.createTextOutput("Desafío registrado exitosamente").setMimeType(ContentService.MimeType.TEXT);
    }

    // 3. REGISTRO DE CONTACTO / CRM
    if (tipoFormulario === 'Contacto') {
      var sheetContacto = doc.getSheetByName('Historial_Contactos') || doc.insertSheet('Historial_Contactos');
      sheetContacto.appendRow([new Date(), e.parameter.correoDestino, e.parameter.nombreStartup, "Pendiente de contacto"]);
      return ContentService.createTextOutput("Contacto registrado").setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
