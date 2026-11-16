// Motor Conceptual Industrial, Indexador TF-IDF y Agente Guía — CIDERE Biobío

export const BUSQUEDAS_SUGERIDAS = [
    { label: "Valorizar residuos de madera o biomasa", query: "reutilizar desechos de madera aserrin corteza" },
    { label: "Predecir fallas y desgaste en líneas", query: "evitar detenciones por desgaste y fallas en maquinaria" },
    { label: "Tratamiento y recirculación de agua", query: "reducir consumo de agua y tratar efluentes industriales" },
    { label: "Automatizar control de calidad en línea", query: "inspeccion visual detectar defectos sin detener linea" }
];

const STOPWORDS_ES = new Set([
    "para", "como", "con", "que", "los", "las", "del", "una", "uno", "unos", "unas",
    "por", "tengo", "necesito", "busco", "problema", "problemas", "empresa", "empresas",
    "proceso", "procesos", "sistema", "sistemas", "solucion", "soluciones", "mediante",
    "traves", "donde", "cuando", "sobre", "entre", "desde", "hasta", "pero", "mas",
    "este", "esta", "estos", "estas", "ese", "esa", "nuestro", "nuestra", "actualmente",
    "poder", "hacer", "realizar", "forma", "manera", "nivel", "tipo", "area", "region"
]);

// Matriz bidireccional: Síntomas operativos de la industria <-> Mecanismos tecnológicos en capacidades
const PUENTES_PROBLEMA_SOLUCION = [
    {
        id: "circularidad",
        nombre: "Economía Circular y Valorización de Subproductos",
        sintomas: [
            "basura", "desech", "desperdici", "aserrin", "cortez", "lod", "recicl",
            "reutiliz", "merm", "subproduct", "contamin", "residu", "descart", "organic",
            "verteder", "quema", "emision", "escombr", "plastico"
        ],
        mecanismos: [
            "valoriz", "biobasad", "compostabl", "circular", "biomas", "revaloriz",
            "recuper", "aprovech", "biodegrad", "biorrefineri", "remanufactur", "subproduct"
        ],
        enfoque: "transformación de residuos o mermas operativas en insumos de mayor valor"
    },
    {
        id: "predictivo",
        nombre: "Mantenimiento Predictivo y Sensorización Industrial",
        sintomas: [
            "fall", "romp", "detencion", "parad", "desgast", "calent", "vibracion",
            "predec", "anticip", "averi", "rotur", "motor", "rodill", "maquinari", "equipos"
        ],
        mecanismos: [
            "predictiv", "monitore", "iot", "termografi", "telemetri", "diagnostic",
            "tiempo real", "sensor", "vibracion", "condicion", "alerta temprana", "scada"
        ],
        enfoque: "monitoreo continuo y detección anticipada de anomalías mecánicas o térmicas"
    },
    {
        id: "vision_calidad",
        nombre: "Inspección Automatizada y Control de Calidad",
        sintomas: [
            "defect", "griet", "fisur", "impurez", "error manual", "clasific", "calibr",
            "inspeccion", "oj", "lento", "muestre", "estandar", "rechaz", "superficial"
        ],
        mecanismos: [
            "vision artificial", "camar", "espectroscopi", "automatiz", "optic", "laser",
            "reconocimiento", "imagenes", "metrologi", "precision", "linea"
        ],
        enfoque: "automatización de la inspección y aseguramiento de calidad en línea sin detener el flujo"
    },
    {
        id: "hidrico",
        nombre: "Gestión Hídrica y Tratamiento de Efluentes",
        sintomas: [
            "agu", "sequi", "hidric", "salin", "efluent", "ril", "riles", "consumo de agua",
            "filtr", "turbidez", "humedad", "riego", "escasez", "vertimiento"
        ],
        mecanismos: [
            "recircul", "biofiltr", "tratamiento", "osmos", "eficiencia hidric", "depur",
            "humedal", "purific", "desalin", "reuso", "captacion"
        ],
        enfoque: "depuración, biofiltración y recirculación eficiente del recurso hídrico"
    },
    {
        id: "energia",
        nombre: "Eficiencia Energética y Descarbonización",
        sintomas: [
            "luz", "electric", "energet", "calor", "vapor", "combustibl", "calder",
            "huella de carbono", "carbon", "consumo electrico", "termic", "gas", "diesel"
        ],
        mecanismos: [
            "fotovoltaic", "hidrogen", "biomasa", "optimizacion termic", "cogener",
            "renovable", "eficiencia energetic", "aislacion", "ahorro energetic", "almacenamiento"
        ],
        enfoque: "optimización del consumo energético, recuperación térmica y reducción de huella de carbono"
    },
    {
        id: "logistica",
        nombre: "Logística Inteligente y Trazabilidad",
        sintomas: [
            "transport", "bodeg", "inventari", "despach", "camion", "perdid", "rastre",
            "caden", "acopi", "abastec", "demor", "distribu", "stock", "turno", "personal"
        ],
        mecanismos: [
            "trazabil", "logistic", "cadena de suministro", "geolocaliz", "flot", "rut",
            "gestion", "planific", "erp", "seguimiento", "codig", "rfid"
        ],
        enfoque: "visibilidad, control operacional y trazabilidad en tiempo real de recursos y flujos"
    },
    {
        id: "seguridad",
        nombre: "Seguridad Laboral y Prevención de Riesgos",
        sintomas: [
            "accident", "riesg", "altur", "carga pesad", "toxic", "fatig", "seguridad",
            "ergonomi", "lesion", "exposicion", "peligr", "protocolo"
        ],
        mecanismos: [
            "epp", "robotic", "exoesquelet", "alert", "ambiental", "prevencion",
            "seguridad ocupacional", "autonom", "teleoper", "proteccion"
        ],
        enfoque: "reducción de exposición al riesgo operativo mediante automatización y monitoreo preventivo"
    },
    {
        id: "biotec",
        nombre: "Biotecnología, Sanidad e Inocuidad",
        sintomas: [
            "plag", "enfermedad", "mortalidad", "patogen", "cultiv", "suel", "antibiotic",
            "inocuidad", "bacteri", "hong", "contaminacion biologica", "rendimiento agricola"
        ],
        mecanismos: [
            "biotecnologi", "bioinsum", "microbiologi", "genetic", "probiotic", "biologic",
            "formulad", "biofertiliz", "biocontrol", "enzim", "extract"
        ],
        enfoque: "aplicación de desarrollos biotecnológicos y bioinsumos para sanidad y productividad"
    },
    {
        id: "datos_ia",
        nombre: "Analítica de Datos, Simulación y Software",
        sintomas: [
            "planill", "papel", "desorden", "proyeccion", "demand", "datos dispers",
            "manual", "estim", "incertidumbr", "decision", "report"
        ],
        mecanismos: [
            "inteligencia artificial", "analitic", "dashboard", "simul", "gemelo digital",
            "algoritm", "machine learning", "software", "plataform", "modelamiento", "big data"
        ],
        enfoque: "modelamiento predictivo y digitalización de datos operativos para toma de decisiones"
    },
    {
        id: "materiales",
        nombre: "Materiales Avanzados y Manufactura",
        sintomas: [
            "corrosion", "aislacion", "resistenci", "pes", "piez", "repuest", "desgast",
            "estructura", "construccion", "durabilidad", "fisur"
        ],
        mecanismos: [
            "recubrimient", "polimer", "impresion 3d", "manufactura aditiv", "estructural",
            "compuest", "nanotecnologi", "aleacion", "prefabric", "material"
        ],
        enfoque: "desarrollo de nuevos materiales, recubrimientos protectores o manufactura especializada"
    }
];

function limpiarTexto(texto) {
    if (!texto) return '';
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * Lematizador ligero para español: agrupa variaciones morfológicas
 * Ej: "automatizacion", "automatizar", "automatizado" -> "automatiz"
 */
function stemEs(palabra) {
    let w = limpiarTexto(palabra);
    if (w.length <= 4) return w;
    w = w.replace(/(aciones|acion|amientos|amiento|imientos|imiento|adores|adora|idades|idad|mente|ando|iendo|ables|able|ibles|ible|icos|icas|ico|ica|ivos|ivas|ivo|iva|ar|er|ir|os|as|es|o|a|e|s)$/, '');
    return w.length >= 3 ? w : limpiarTexto(palabra);
}

function tokenizar(texto) {
    const limpio = limpiarTexto(texto).replace(/[^a-z0-9\s]/g, ' ');
    return limpio
        .split(/\s+/)
        .filter(p => p.length > 2 && !STOPWORDS_ES.has(p))
        .map(stemEs);
}

/**
 * Construye un índice TF-IDF dinámico sobre el catálogo real cargado desde Google Sheets.
 * Identifica qué palabras son realmente distintivas en `queHace` y `comoHace`.
 */
function construirIndiceCatalogo(registry) {
    const N = registry.length || 1;
    const docFreq = new Map();
    const docsIndexados = registry.map(item => {
        const tokensNombre = new Set(tokenizar(item.nombre));
        const tokensQue = new Set(tokenizar(item.queHace));
        const tokensComo = new Set(tokenizar(item.comoHace));
        const tokensInd = new Set(tokenizar(`${item.industria} ${item.institucion}`));

        const todosUnicos = new Set([...tokensNombre, ...tokensQue, ...tokensComo, ...tokensInd]);
        todosUnicos.forEach(t => {
            docFreq.set(t, (docFreq.get(t) || 0) + 1);
        });

        return { item, tokensNombre, tokensQue, tokensComo, tokensInd };
    });

    const idf = new Map();
    docFreq.forEach((df, token) => {
        // Palabras poco frecuentes en el catálogo reciben mayor peso técnico
        idf.set(token, Math.log((N + 1) / (df + 1)) + 1);
    });

    return { docsIndexados, idf };
}

export function extraerNumeroTRL(trlRaw) {
    if (!trlRaw) return null;
    const str = trlRaw.toString().trim();
    if (str.toLowerCase().includes('validar')) return null;
    const match = str.match(/(\d)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * 1. BUSCADOR GLOBAL CONCEPTUAL (TF-IDF + Puentes Problema-Solución)
 */
export function evaluarBuscadorConceptual(consultaUsuario, registry) {
    const qLimpia = limpiarTexto(consultaUsuario);
    if (!qLimpia || registry.length === 0) return { intencionDetectada: null, resultados: [] };

    const tokensQuery = tokenizar(qLimpia);
    const { docsIndexados, idf } = construirIndiceCatalogo(registry);

    let intencionDetectada = null;
    const puentesActivos = [];

    PUENTES_PROBLEMA_SOLUCION.forEach(puente => {
        const activa = puente.sintomas.some(s => qLimpia.includes(s)) || puente.mecanismos.some(m => qLimpia.includes(m));
        if (activa) {
            puentesActivos.push(puente);
            if (!intencionDetectada) intencionDetectada = puente.nombre;
        }
    });

    const evaluados = docsIndexados.map(doc => {
        const { item, tokensNombre, tokensQue, tokensComo, tokensInd } = doc;
        const textoCapacidad = limpiarTexto(`${item.nombre} ${item.queHace} ${item.comoHace} ${item.industria}`);
        let score = 0;

        // A. Similitud léxica ponderada por especificidad (TF-IDF)
        tokensQuery.forEach(tq => {
            const peso = idf.get(tq) || 1;
            if (tokensNombre.has(tq)) score += 18 * peso;
            if (tokensQue.has(tq)) score += 14 * peso;
            if (tokensComo.has(tq)) score += 15 * peso;
            if (tokensInd.has(tq)) score += 8 * peso;
        });

        // B. Puentes Problema -> Solución
        puentesActivos.forEach(puente => {
            const resuelveMecanismo = puente.mecanismos.some(m => textoCapacidad.includes(m));
            const comparteSintoma = puente.sintomas.some(s => textoCapacidad.includes(s));
            if (resuelveMecanismo) score += 38;
            else if (comparteSintoma) score += 20;
        });

        return { item, score };
    });

    const resultados = evaluados
        .filter(e => e.score >= 12)
        .sort((a, b) => b.score - a.score)
        .map(e => e.item);

    return { intencionDetectada, resultados };
}

/**
 * 2. AGENTE GUÍA EN FORMULACIÓN DE DESAFÍOS (Conciencia de estructura + Radar de catálogo)
 */
export function analizarCalidadDesafio(texto, rubroSeleccionado = "", registry = []) {
    const t = limpiarTexto(texto);

    const tieneProblema = t.length >= 25 && (
        /(problem|fall|merm|cost|lent|manual|residu|desgast|perdid|detencion|cuell|dificultad|necesit|busc|optimiz|reduc|mejor|control|medir|variacion|satur|averi|riesg)/.test(t)
    );

    const tieneEntorno = t.length >= 45 && (
        /(plant|line|proces|faen|humedad|temperatur|velocidad|agu|salin|espaci|normativ|meses|plaz|tonelad|litr|turn|operacion|equip|maquin|cultiv|bosqu|puert|fri|calor|continu)/.test(t)
    );

    const tieneImpacto = t.length >= 40 && (
        /(%|porcentaj|ahorr|disminu|aument|automatiz|tiempo real|reutiliz|valoriz|certific|eficienci|impact|benefici|rentabil|huell|seguridad|evit|anticip)/.test(t)
    );

    const cumplidos = [tieneProblema, tieneEntorno, tieneImpacto].filter(Boolean).length;

    let consejo = "Describe qué ocurre actualmente en tu operación, bajo qué condiciones técnicas y qué resultado esperas lograr.";
    if (t.length > 0 && t.length < 25) {
        consejo = "Amplía un poco más la descripción para que el motor contraste el problema con el «¿Qué hace?» y «¿Cómo lo hace?» de las capacidades.";
    } else if (!tieneProblema) {
        consejo = "Sugerencia del Guía: Precisa cuál es el síntoma operativo o cuello de botella que buscas resolver.";
    } else if (!tieneEntorno) {
        consejo = "Sugerencia del Guía: Agrega alguna restricción o condición de entorno (volumen, humedad, temperatura, espacio o plazo).";
    } else if (!tieneImpacto) {
        consejo = "Sugerencia del Guía: Indica la meta o impacto esperado (ej. % de reducción de detenciones, ahorro o automatización).";
    } else {
        consejo = "Formulación completa: el motor tiene contexto suficiente para cruzar causa raíz con tecnologías base.";
    }

    // Radar en vivo del catálogo real
    let radarHtml = "";
    if (registry.length > 0 && (rubroSeleccionado || t.length >= 20)) {
        const enRubro = rubroSeleccionado
            ? registry.filter(s => limpiarTexto(s.industria) === limpiarTexto(rubroSeleccionado)).length
            : 0;

        const puenteDetectado = PUENTES_PROBLEMA_SOLUCION.find(p =>
            p.sintomas.some(s => t.includes(s)) || p.mecanismos.some(m => t.includes(m))
        );

        let partesRadar = [];
        if (rubroSeleccionado) {
            partesRadar.push(`<b>${enRubro}</b> capacidades directas en <b>${rubroSeleccionado}</b>`);
        }
        if (puenteDetectado) {
            partesRadar.push(`eje tecnológico detectado: <b>${puenteDetectado.nombre}</b>`);
        }

        if (partesRadar.length > 0) {
            radarHtml = `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: var(--cidere-blue);">
                <b>Radar del ecosistema:</b> ${partesRadar.join(" • ")}.
            </div>`;
        }
    }

    return {
        puntaje: cumplidos,
        criterios: {
            problema: tieneProblema,
            entorno: tieneEntorno,
            impacto: tieneImpacto
        },
        consejo,
        radarHtml
    };
}

/**
 * 3. MATCHMAKING PROFUNDO: CONTRASTE PROBLEMA <-> CAPACIDAD (`queHace` + `comoHace`)
 */
export function ejecutarMatchLocalConceptual(desafio, registry) {
    const { rubro, nivelRiesgo, titulo, descripcion } = desafio;
    if (!registry || registry.length === 0) return [];

    const textoDesafio = limpiarTexto(`${titulo} ${descripcion}`);
    const tokensDesafio = tokenizar(textoDesafio);
    const { docsIndexados, idf } = construirIndiceCatalogo(registry);

    // Umbral de madurez acumulativo
    let minTrlPermitido = 1;
    let targetMin = 1, targetMax = 3;

    if (nivelRiesgo.includes('1-3')) {
        minTrlPermitido = 1; targetMin = 1; targetMax = 3;
    } else if (nivelRiesgo.includes('4-6')) {
        minTrlPermitido = 4; targetMin = 4; targetMax = 6;
    } else if (nivelRiesgo.includes('7-9')) {
        minTrlPermitido = 7; targetMin = 7; targetMax = 9;
    }

    // Identificar qué arquetipos de problema presenta la empresa
    const puentesDelDesafio = PUENTES_PROBLEMA_SOLUCION.filter(puente =>
        puente.sintomas.some(s => textoDesafio.includes(s)) ||
        puente.mecanismos.some(m => textoDesafio.includes(m))
    );

    const evaluados = docsIndexados
        .filter(({ item }) => {
            const trlNum = extraerNumeroTRL(item.trlMax);
            if (trlNum === null) {
                // Capacidades "Por validar" son admisibles en riesgo alto/medio, pero no en riesgo bajo (7-9)
                return minTrlPermitido <= 4;
            }
            return trlNum >= minTrlPermitido;
        })
        .map(({ item, tokensNombre, tokensQue, tokensComo }) => {
            const trlNum = extraerNumeroTRL(item.trlMax);
            const coincideRubro = limpiarTexto(item.industria) === limpiarTexto(rubro);
            const textoQue = limpiarTexto(item.queHace);
            const textoComo = limpiarTexto(item.comoHace);
            const textoCapacidad = `${limpiarTexto(item.nombre)} ${textoQue} ${textoComo}`;

            // 1. Puntaje de Resolución del Problema (Máx ~80 pts)
            let puntajeProblemaSolucion = 0;
            let puentePrincipal = null;
            let mejorScorePuente = 0;

            puentesDelDesafio.forEach(puente => {
                let hitsMecanismo = 0;
                let hitsSintoma = 0;

                puente.mecanismos.forEach(m => {
                    if (textoComo.includes(m)) hitsMecanismo += 2; // El "Cómo lo hace" tiene el mecanismo exacto
                    else if (textoQue.includes(m)) hitsMecanismo += 1.5;
                });

                puente.sintomas.forEach(s => {
                    if (textoQue.includes(s)) hitsSintoma += 1;
                });

                const scoreEstePuente = Math.min(48, (hitsMecanismo * 14) + (hitsSintoma * 8));
                if (scoreEstePuente > mejorScorePuente) {
                    mejorScorePuente = scoreEstePuente;
                    puentePrincipal = puente;
                }
            });
            puntajeProblemaSolucion += mejorScorePuente;

            // 2. Puntaje de Similitud Técnica Específica (TF-IDF sobre `queHace` y `comoHace`)
            let puntajeTfIdf = 0;
            tokensDesafio.forEach(td => {
                const peso = idf.get(td) || 1;
                if (tokensComo.has(td)) puntajeTfIdf += 7.5 * peso;
                if (tokensQue.has(td)) puntajeTfIdf += 6.5 * peso;
                if (tokensNombre.has(td)) puntajeTfIdf += 5 * peso;
            });
            puntajeProblemaSolucion += Math.min(34, puntajeTfIdf);

            // 3. Bonificador contextual de Rubro (+18 pts, no reemplaza la pertinencia técnica)
            const bonusRubro = coincideRubro ? 18 : 0;

            // 4. Alineación con rango TRL preferido (+8 pts)
            const esExacto = trlNum !== null && trlNum >= targetMin && trlNum <= targetMax;
            const esMayorMadurez = trlNum !== null && trlNum > targetMax;
            const bonusTrl = esExacto ? 8 : 0;

            const scoreTotal = puntajeProblemaSolucion + bonusRubro + bonusTrl;

            // Normalizar afinidad visible (64% - 98%)
            const afinidad = Math.min(98, Math.max(64, Math.round(52 + (scoreTotal * 0.48))));

            // Construir justificación técnica contrastando Problema vs. Qué hace / Cómo lo hace
            const justificacion = generarJustificacionEspecifica(
                item,
                coincideRubro,
                rubro,
                puentePrincipal,
                puntajeProblemaSolucion
            );

            return {
                item,
                scoreTotal,
                puntajeProblemaSolucion,
                afinidad,
                justificacion,
                esExacto,
                esMayorMadurez,
                coincideRubro
            };
        });

    // Filtrar: Exigir pertinencia real con el problema (>= 16 pts técnicos) o coincidencia directa de sector con algo de afinidad
    return evaluados
        .filter(c => c.puntajeProblemaSolucion >= 16 || (c.coincideRubro && c.puntajeProblemaSolucion >= 8))
        .sort((a, b) => b.scoreTotal - a.scoreTotal)
        .slice(0, 6);
}

function generarJustificacionEspecifica(item, coincideRubro, rubroBuscado, puentePrincipal, puntajeTecnico) {
    const extractoComo = item.comoHace && item.comoHace.length > 12
        ? item.comoHace.trim().replace(/\.$/, '')
        : null;
    const extractoQue = item.queHace && item.queHace.length > 12
        ? item.queHace.trim().replace(/\.$/, '')
        : null;

    const encabezadoSector = coincideRubro
        ? `Capacidad del sector ${item.industria}`
        : `Transferencia tecnológica desde ${item.industria} hacia ${rubroBuscado}`;

    if (puentePrincipal && extractoComo) {
        return `${encabezadoSector}: aborda la ${puentePrincipal.enfoque} mediante ${extractoComo.charAt(0).toLowerCase() + extractoComo.slice(1)}.`;
    }

    if (puntajeTecnico >= 18 && extractoComo && extractoQue) {
        return `${encabezadoSector}: su tecnología (${extractoComo.slice(0, 95)}${extractoComo.length > 95 ? '...' : ''}) responde directamente al requerimiento operativo planteado.`;
    }

    if (extractoQue) {
        return `${encabezadoSector}: orientada a ${extractoQue.charAt(0).toLowerCase() + extractoQue.slice(1)}.`;
    }

    return `${encabezadoSector} compatible con el umbral de madurez tecnológica solicitado.`;
}
