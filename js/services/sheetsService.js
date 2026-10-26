export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxN3oEYr2N8JZ5byhat94XMa_QwPe48sv-6Z6get94tmDpWrJwsTqg2-6LVC_5QWDH_GQ/exec"; 
export const CSV_STARTUPS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9bjV9qSRsPyVgCceJH3oKnkmMkJ2kd_aIE-FEQcUXhd7Tdo_BnRsMLtfSe7CMCETDOn5Il4kmfD5n/pub?gid=174902125&single=true&output=csv";
export const CSV_DESAFIOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9bjV9qSRsPyVgCceJH3oKnkmMkJ2kd_aIE-FEQcUXhd7Tdo_BnRsMLtfSe7CMCETDOn5Il4kmfD5n/pub?gid=1430585904&single=true&output=csv";

/**
 * Consulta la base de datos de Startups e IES
 */
export function fetchStartups() {
    return new Promise((resolve, reject) => {
        Papa.parse(CSV_STARTUPS, {
            download: true,
            complete: function(results) {
                const filas = results.data;
                const startups = [];
                for (let i = 1; i < filas.length; i++) {
                    const ultimaCol = filas[i][filas[i].length - 1];
                    if (filas[i].length >= 8 && filas[i][1] && ultimaCol && ultimaCol.trim() === 'Aprobado') {
                        startups.push({
                            id: filas[i][0],
                            nombre: filas[i][1],
                            tipo: filas[i][2] || "Startup",
                            institucion: filas[i][3] || "",
                            industria: filas[i][4],
                            queHace: filas[i][5],
                            comoHace: filas[i][6],
                            trlMax: filas[i][7] ? (isNaN(parseInt(filas[i][7])) ? filas[i][7] : parseInt(filas[i][7])) : "Por validar",
                            contacto: filas[i][8],
                            evidencias: {}
                        });
                    }
                }
                resolve(startups);
            },
            error: (err) => reject(err)
        });
    });
}

/**
 * Consulta la base de datos de Desafíos aprobados
 */
export function fetchDesafios() {
    return new Promise((resolve, reject) => {
        Papa.parse(CSV_DESAFIOS, {
            download: true,
            complete: function(results) {
                const filas = results.data;
                const desafios = [];
                for (let i = 1; i < filas.length; i++) {
                    const fila = filas[i];
                    if (!fila || fila.length < 3) continue;
                    const estado = fila[fila.length - 1];
                    if (estado && estado.trim() === 'Aprobado') {
                        const empresa = fila[1] || 'Empresa';
                        const textosCandidatos = fila.slice(2, fila.length - 1)
                            .map(t => (t ? t.trim() : ''))
                            .filter(t => t !== '' && t !== 'Empresa' && t !== 'Aprobado' && isNaN(t));

                        let titulo = '';
                        let descripcion = '';

                        if (textosCandidatos.length >= 2) {
                            titulo = textosCandidatos[textosCandidatos.length - 2];
                            descripcion = textosCandidatos[textosCandidatos.length - 1];
                        } else if (textosCandidatos.length === 1) {
                            titulo = textosCandidatos[0];
                            descripcion = fila[4] || fila[3] || 'Desafío estratégico de innovación abierta.';
                        } else {
                            titulo = fila[3] || fila[5] || 'Desafío de Innovación';
                            descripcion = fila[4] || fila[6] || '';
                        }

                        desafios.push({ empresa, titulo, descripcion });
                    }
                }
                resolve(desafios);
            },
            error: (err) => reject(err)
        });
    });
}

/**
 * Envia formularios al Web App de Google Apps Script
 */
export function postToAppsScript(formData) {
    return fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    });
}
