// Motor Conceptual Industrial y Agente Guía — CIDERE Biobío

export const BUSQUEDAS_SUGERIDAS = [
    { label: "Valorizar residuos de madera o biomasa", query: "reutilizar desechos de madera aserrin corteza" },
    { label: "Predecir fallas y desgaste en líneas", query: "evitar detenciones por desgaste y fallas en maquinaria" },
    { label: "Tratamiento y recirculación de agua", query: "reducir consumo de agua y tratar efluentes industriales" },
    { label: "Trazabilidad logística en tiempo real", query: "controlar inventario transporte y trazabilidad en planta" }
];

const MAPA_CONCEPTUAL_BIOBIO = [
    {
        nombre: "Economía Circular y Valorización de Residuos",
        disparadores: ["basura", "desecho", "desperdicio", "aserrin", "corteza", "lodos", "reciclar", "reutilizar", "merma", "subproducto", "contaminacion", "residuo", "descarte", "organico"],
        expansiones: ["valorizacion", "biobasado", "compostable", "circular", "biomasa", "revalorizacion", "tratamiento", "efluentes", "biodegradable", "recuperacion", "aprovechamiento"],
        justificacionBase: "Capacidad enfocada en transformar subproductos o mermas operativas en insumos de mayor valor, alineada con economía circular industrial."
    },
    {
        nombre: "Mantenimiento Predictivo y Automatización en Línea",
        disparadores: ["falla", "rompe", "detencion", "parada", "desgaste", "calentamiento", "vibracion", "predecir", "anticipar", "sensor", "manual", "inspeccion", "calidad", "linea"],
        expansiones: ["predictivo", "monitoreo", "iot", "termografia", "vision artificial", "telemetria", "diagnostico", "tiempo real", "automatizacion", "sensores", "algoritmo", "ia"],
        justificacionBase: "Solución orientada a sensorizar procesos continuos y anticipar desviaciones o fallas críticas sin detener la operación."
    },
    {
        nombre: "Eficiencia Energética y Gestión Hídrica",
        disparadores: ["luz", "electricidad", "gasto energetico", "consumo de agua", "sequia", "calor", "vapor", "combustible", "efluente", "salinidad", "riego", "humedad"],
        expansiones: ["energetica", "hidrica", "recirculacion", "termica", "renovable", "optimizacion", "ahorro", "eficiencia", "filtracion", "biofiltracion", "tratamiento"],
        justificacionBase: "Tecnología diseñada para optimizar el consumo de recursos críticos (agua/energía) y mejorar la sustentabilidad de planta."
    },
    {
        nombre: "Logística Inteligente y Trazabilidad",
        disparadores: ["transporte", "bodega", "inventario", "despacho", "camiones", "perdida", "rastreo", "cadena", "catastrofe", "emergencia", "acopio"],
        expansiones: ["trazabilidad", "logistica", "cadena de suministro", "geolocalizacion", "control", "flota", "software", "plataforma", "digital", "gestion"],
        justificacionBase: "Herramienta digital que entrega visibilidad y control en tiempo real sobre flujos logísticos, inventarios y distribución."
    },
    {
        nombre: "Biotecnología y Materiales Avanzados",
        disparadores: ["quimico", "toxico", "envase", "empaque", "plastico", "corrosivo", "cultivo", "plaga", "sanitario", "inocuidad", "alimento"],
        expansiones: ["biotecnologia", "biologico", "formulado", "recubrimiento", "empaque", "inocuidad", "microbiologia", "bioinsumo", "sustentable"],
        justificacionBase: "Desarrollo científico-tecnológico basado en formulaciones avanzadas o biotecnología aplicada a estándares productivos."
    }
];

function limpiarTexto(texto) {
    if (!texto) return '';
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * 1. BUSCADOR GLOBAL CONCEPTUAL
 * Comprende intenciones industriales además de coincidencias textuales directas.
 */
export function evaluarBuscadorConceptual(consultaUsuario, registry) {
    const q = limpiarTexto(consultaUsuario);
    if (!q) return { intencionDetectada: null, resultados: [] };

    let intencionDetectada = null;
    const conceptosActivos = [];

    MAPA_CONCEPTUAL_BIOBIO.forEach(grupo => {
        const activa = grupo.disparadores.some(d => q.includes(d)) || grupo.expansiones.some(e => q.includes(e));
        if (activa) {
            conceptosActivos.push(grupo);
            if (!intencionDetectada) intencionDetectada = grupo.nombre;
        }
    });

    const palabrasClave = q.split(/\s+/).filter(p => p.length > 3 && !["para", "como", "con", "que", "los", "las", "del", "una", "por", "tengo", "necesito", "busco", "problema"].includes(p));

    const evaluados = registry.map(item => {
        const textoCompleto = limpiarTexto(`${item.nombre} ${item.queHace} ${item.comoHace} ${item.industria} ${item.institucion}`);
        let score = 0;

        // Coincidencia directa por términos relevantes
        palabrasClave.forEach(palabra => {
            if (limpiarTexto(item.nombre).includes(palabra)) score += 35;
            else if (textoCompleto.includes(palabra)) score += 20;
        });

        // Coincidencia por comprensión conceptual
        conceptosActivos.forEach(grupo => {
            const matchExpansion = grupo.expansiones.some(e => textoCompleto.includes(e));
            const matchDisparador = grupo.disparadores.some(d => textoCompleto.includes(d));
            if (matchExpansion) score += 45;
            else if (matchDisparador) score += 25;
        });

        return { item, score };
    });

    const resultados = evaluados
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(e => e.item);

    return { intencionDetectada, resultados };
}

/**
 * 2. AGENTE GUÍA EN FORMULACIÓN DE DESAFÍOS
 * Evalúa en tiempo real si el problema describe: Síntoma, Entorno/Condiciones e Impacto esperado.
 */
export function analizarCalidadDesafio(texto) {
    const t = limpiarTexto(texto);

    const tieneProblema = t.length >= 25 && (
        /(problema|falla|merma|costo|lento|manual|residuo|desgaste|perdida|detencion|cuello|dificultad|necesitamos|buscamos|optimizar|reducir|mejorar|controlar|medir)/.test(t)
    );

    const tieneEntorno = t.length >= 45 && (
        /(planta|linea|proceso|faena|humedad|temperatura|velocidad|agua|salinidad|espacio|normativa|meses|plazo|toneladas|litros|turno|operacion|equipo|maquina|cultivo|bosque|puerto)/.test(t)
    );

    const tieneImpacto = t.length >= 40 && (
        /(%|porcentaje|ahorro|disminuir|aumentar|automatizar|tiempo real|reutilizar|valorizar|certificar|eficiencia|impacto|beneficio|rentabilidad|huella|seguridad)/.test(t)
    );

    const cumplidos = [tieneProblema, tieneEntorno, tieneImpacto].filter(Boolean).length;

    let consejo = "Describe qué ocurre actualmente en tu operación, bajo qué condiciones y qué resultado esperas lograr.";
    if (t.length > 0 && t.length < 25) {
        consejo = "Amplía un poco más la descripción para que el motor identifique la tecnología base adecuada.";
    } else if (!tieneProblema) {
        consejo = "Sugerencia del Guía: Precisa cuál es el síntoma principal o cuello de botella operativo.";
    } else if (!tieneEntorno) {
        consejo = "Sugerencia del Guía: Indica alguna condición de entorno (ej. volumen, humedad, velocidad, espacio o plazo).";
    } else if (!tieneImpacto) {
        consejo = "Sugerencia del Guía: Añade el impacto o meta esperada (ej. % de reducción de mermas o automatización).";
    } else {
        consejo = "Excelente formulación: el desafío contiene contexto operativo, restricciones y objetivo claro para matchmaking.";
    }

    return {
        puntaje: cumplidos,
        criterios: {
            problema: tieneProblema,
            entorno: tieneEntorno,
            impacto: tieneImpacto
        },
        consejo
    };
}

/**
 * 3. MATCHMAKING CONCEPTUAL LOCAL + UMBRAL TRL ACUMULATIVO
 * Opera de forma inmediata y también sirve de respaldo si la API externa no está configurada.
 */
export function ejecutarMatchLocalConceptual(desafio, registry) {
    const { rubro, nivelRiesgo, titulo, descripcion } = desafio;
    const textoDesafio = limpiarTexto(`${titulo} ${descripcion}`);

    let minTrlPermitido = 1;
    let targetMin = 1, targetMax = 3;

    if (nivelRiesgo.includes('1-3')) {
        minTrlPermitido = 1; targetMin = 1; targetMax = 3;
    } else if (nivelRiesgo.includes('4-6')) {
        minTrlPermitido = 4; targetMin = 4; targetMax = 6;
    } else if (nivelRiesgo.includes('7-9')) {
        minTrlPermitido = 7; targetMin = 7; targetMax = 9;
    }

    // Detectar conceptos presentes en el desafío
    const conceptosDesafio = MAPA_CONCEPTUAL_BIOBIO.filter(grupo =>
        grupo.disparadores.some(d => textoDesafio.includes(d)) ||
        grupo.expansiones.some(e => textoDesafio.includes(e))
    );

    const palabrasDesafio = textoDesafio.split(/\s+/).filter(p => p.length > 4);

    const candidatos = registry.filter(item => {
        const trlVal = parseInt(item.trlMax) || 1;
        return trlVal >= minTrlPermitido;
    }).map(item => {
        const trlVal = parseInt(item.trlMax) || 1;
        const coincideRubro = limpiarTexto(item.industria) === limpiarTexto(rubro);
        const textoCapacidad = limpiarTexto(`${item.nombre} ${item.queHace} ${item.comoHace} ${item.industria}`);

        let score = 0;
        let razonConceptual = "";

        if (coincideRubro) score += 45;

        // Evaluar afinidad conceptual profunda (incluso intersectorial)
        conceptosDesafio.forEach(grupo => {
            const capTieneSolucion = grupo.expansiones.some(e => textoCapacidad.includes(e));
            if (capTieneSolucion) {
                score += 40;
                if (!razonConceptual) razonConceptual = grupo.justificacionBase;
            }
        });

        // Coincidencia de términos técnicos específicos
        let hitsTecnicos = 0;
        palabrasDesafio.forEach(p => {
            if (textoCapacidad.includes(p)) hitsTecnicos++;
        });
        score += Math.min(hitsTecnicos * 8, 24);

        // Ajuste por cercanía al rango TRL preferido
        const esExacto = trlVal >= targetMin && trlVal <= targetMax;
        const esMayorMadurez = trlVal > targetMax;
        if (esExacto) score += 12;

        // Normalizar afinidad entre 65% y 97% para candidatos relevantes
        const afinidad = Math.min(97, Math.max(62, score));

        // Construir justificación técnica legible
        let justificacion = razonConceptual;
        if (!justificacion) {
            if (coincideRubro) {
                justificacion = `Especialización directa en el sector ${item.industria} con tecnología aplicable a los requerimientos operativos planteados.`;
            } else {
                justificacion = `Transferencia tecnológica intersectorial desde ${item.industria}: su metodología (${item.comoHace.slice(0, 75)}...) aborda la causa raíz del desafío.`;
            }
        }

        return {
            item,
            score,
            afinidad,
            justificacion,
            esExacto,
            esMayorMadurez,
            coincideRubro
        };
    });

    // Filtrar solo los que tienen coincidencia de rubro o alta afinidad conceptual (>= 55)
    return candidatos
        .filter(c => c.coincideRubro || c.score >= 55)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
}
