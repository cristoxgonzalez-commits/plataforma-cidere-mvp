import { fetchStartups, fetchDesafios, postToAppsScript } from './services/sheetsService.js';

// ESTADO GLOBAL
let startupsRegistry = [];
let empresaSeleccionadaActual = null;
let filtroIndustriaStartupActual = 'Todos';
let filtroIndustriaIESActual = 'Todos';

const trlDefinitions = [
    { level: 1, title: "TRL 1: Principios básicos observados", desc: "Investigación inicial" },
    { level: 2, title: "TRL 2: Concepto tecnológico formulado", desc: "Formulación teórica" },
    { level: 3, title: "TRL 3: Prueba de concepto", desc: "Demostración experimental" },
    { level: 4, title: "TRL 4: Validación en laboratorio", desc: "Componentes validados" },
    { level: 5, title: "TRL 5: Entorno simulado", desc: "Validación en entorno relevante" },
    { level: 6, title: "TRL 6: Prototipo funcional", desc: "Demostración en condiciones operativas" },
    { level: 7, title: "TRL 7: Entorno operativo real", desc: "Piloto en cliente" },
    { level: 8, title: "TRL 8: Sistema completo", desc: "Tecnología certificada" },
    { level: 9, title: "TRL 9: Comercializado con éxito", desc: "Producción continua" }
];

const INDUSTRIAS = [
    'Todos', 'Agroindustria', 'Manufactura', 'Energía', 'Logística',
    'Agua y Sanitario', 'Alimentos', 'Salud', 'Forestal',
    'Pesca y Acuicultura', 'Minería', 'Tecnología / Software'
];

function normalizar(texto) {
    if (!texto) return '';
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    refreshIcons();
    initNavegacion();
    initBuscadorSpotlight();
    initFiltrosPills();
    initTRL();
    initCarrusel();
    initModalesFormularios();
    cargarDatos();
});

// NAVEGACIÓN Y VISTAS
function initNavegacion() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btnMobile = document.getElementById('btn-mobile-toggle');

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    };

    btnMobile?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);

    document.querySelectorAll('.nav-list .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            switchView(targetView, item);
        });
    });

    document.querySelectorAll('.top-nav-links li').forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            switchView(targetView, item);
        });
    });

    // Enlace del bloque Hero hacia la Mesa de Innovación
    document.getElementById('hero-link-mesa')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-mesa-innovacion', document.getElementById('btn-top-mesa'));
    });

    // Botones para abrir el modal de publicación de desafíos
    document.getElementById('btn-sidebar-publicar')?.addEventListener('click', () => abrirModalDesafio());
    document.getElementById('btn-mesa-publicar')?.addEventListener('click', () => abrirModalDesafio());
    document.getElementById('btn-desafios-publicar')?.addEventListener('click', () => abrirModalDesafio());

    document.getElementById('btn-subir-startup')?.addEventListener('click', () => abrirModalCapacidad('Startup'));
    document.getElementById('btn-subir-ies')?.addEventListener('click', () => abrirModalCapacidad('IES'));
    document.getElementById('btn-notif')?.addEventListener('click', () => alert('No tienes nuevas notificaciones'));
    document.getElementById('btn-settings')?.addEventListener('click', () => alert('Ajustes de cuenta...'));
}

function switchView(viewId, element = null) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.top-nav-links li').forEach(i => i.classList.remove('active-top'));

    if (element) {
        if (element.classList.contains('nav-item')) element.classList.add('active');
        else element.classList.add('active-top');
    }

    if (window.innerWidth <= 768) {
        document.getElementById('main-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }
}

function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// CARGA DE DATOS ASÍNCRONA
async function cargarDatos() {
    mostrarSkeletons();
    try {
        const [startups, desafios] = await Promise.all([fetchStartups(), fetchDesafios()]);
        startupsRegistry = startups;

        const conteoCapacidades = startupsRegistry.length;
        document.getElementById('kpi-proyectos').innerText = conteoCapacidades;
        document.getElementById('footer-metric-proyectos').innerText = conteoCapacidades;
        document.getElementById('kpi-desafios').innerText = desafios.length;

        renderDesafios(desafios);
        aplicarFiltrosCombine();
        actualizarSelectTRL();
    } catch (err) {
        console.error("Error al cargar datos desde Sheets", err);
    }
}

function mostrarSkeletons() {
    const sk = `
        <div class="skeleton-card">
            <div class="skeleton-bar title"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar short"></div>
        </div>
    `.repeat(3);
    document.getElementById('lista-startups').innerHTML = sk;
    document.getElementById('lista-ies').innerHTML = sk;
}

// RENDERIZADO DE DESAFÍOS EN SU SECCIÓN DEDICADA
function renderDesafios(desafios) {
    const contenedor = document.getElementById('lista-desafios-vigentes');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (desafios.length === 0) {
        contenedor.innerHTML = '<p style="font-size:13px; color:gray; grid-column: span 2;">No hay desafíos aprobados actualmente en convocatoria.</p>';
        return;
    }
    desafios.forEach(d => {
        contenedor.innerHTML += `
            <div class="desafio-card-dark">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="badge badge-green" style="background: rgba(255,255,255,0.18); color: #ffffff;">INDUSTRIA</span>
                        <span style="font-size: 11px; font-family: var(--font-title); color: #01DCFF; letter-spacing: 0.6px; font-weight: 700;">CONVOCATORIA ACTIVA</span>
                    </div>
                    <h4 style="font-size: 16px; font-weight: 700; color: #01DCFF; margin-bottom: 12px; line-height: 1.35;">${d.titulo}</h4>
                    <p style="font-size: 13px; line-height: 1.6; opacity: 0.92; color: #ffffff; margin-bottom: 16px;">
                        <strong style="color: #ffffff;">${d.empresa}:</strong> ${d.descripcion}
                    </p>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px; display: flex; justify-content: flex-end;">
                    <button class="btn-primary" style="background-color: var(--cidere-green-bright); padding: 6px 12px; font-size: 11.5px;" onclick="alert('Para postular una solución a este desafío, utiliza la sección de Mensajería para contactar a CIDERE Biobío.')">
                        Postular Solución
                    </button>
                </div>
            </div>
        `;
    });
    refreshIcons();
}

// FILTROS
function initFiltrosPills() {
    const contS = document.getElementById('filtros-startups');
    const contI = document.getElementById('filtros-ies');

    INDUSTRIAS.forEach(ind => {
        const btnS = document.createElement('button');
        btnS.className = `filter-pill ${ind === 'Todos' ? 'active' : ''}`;
        btnS.innerText = ind;
        btnS.addEventListener('click', () => {
            contS.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btnS.classList.add('active');
            filtroIndustriaStartupActual = ind;
            aplicarFiltrosCombine();
        });
        contS.appendChild(btnS);

        const btnI = document.createElement('button');
        btnI.className = `filter-pill ${ind === 'Todos' ? 'active' : ''}`;
        btnI.innerText = ind;
        btnI.addEventListener('click', () => {
            contI.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btnI.classList.add('active');
            filtroIndustriaIESActual = ind;
            aplicarFiltrosCombine();
        });
        contI.appendChild(btnI);
    });
}

function aplicarFiltrosCombine() {
    const q = normalizar(document.getElementById('buscador-global').value);

    // Startups
    let startups = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'STARTUP');
    const totalS = startups.length;
    if (filtroIndustriaStartupActual !== 'Todos') {
        startups = startups.filter(s => s.industria === filtroIndustriaStartupActual);
    }
    if (q) {
        startups = startups.filter(s => normalizar(s.nombre).includes(q) || normalizar(s.queHace).includes(q) || normalizar(s.industria).includes(q));
    }
    renderGrid('lista-startups', startups, 'STARTUP');
    document.getElementById('contador-startups').innerText = `Mostrando ${startups.length} de ${totalS} desarrollos en esta categoría`;

    // Capacidades Regionales
    let ies = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'IES');
    const totalI = ies.length;
    if (filtroIndustriaIESActual !== 'Todos') {
        ies = ies.filter(s => s.industria === filtroIndustriaIESActual);
    }
    if (q) {
        ies = ies.filter(s => normalizar(s.nombre).includes(q) || normalizar(s.queHace).includes(q) || normalizar(s.institucion).includes(q) || normalizar(s.industria).includes(q));
    }
    renderGrid('lista-ies', ies, 'CAPACIDAD');
    document.getElementById('contador-ies').innerText = `Mostrando ${ies.length} de ${totalI} capacidades regionales`;

    refreshIcons();
}

function renderGrid(containerId, list, tipo) {
    const contenedor = document.getElementById(containerId);
    contenedor.innerHTML = '';
    if (list.length === 0) {
        contenedor.innerHTML = '<p style="font-size: 13px; color: gray;">No hay registros disponibles en esta categoría.</p>';
        return;
    }

    list.forEach(s => {
        const badgeColor = tipo === 'STARTUP' ? 'badge-green' : 'badge-blue';
        const metaField = tipo === 'STARTUP' 
            ? `<b>Contacto:</b> ${s.contacto || 'Privado (Vía CIDERE)'}`
            : `<b>Institución:</b> <span class="meta-highlight">${s.institucion || 'No especificada'}</span>`;
        const trlText = s.trlMax === "Por validar" ? "Por validar" : `TRL ${s.trlMax}`;

        const card = document.createElement('div');
        card.className = 'uniform-card';
        card.innerHTML = `
            <div>
                <div class="uniform-card-header">
                    <span class="badge ${badgeColor}">${tipo}</span>
                    <span class="badge badge-gray" style="font-weight: 700;">${trlText}</span>
                </div>
                <h4 class="uniform-card-title" title="${s.nombre}">${s.nombre}</h4>
                <div class="uniform-card-meta">${metaField}</div>
                <div class="uniform-card-divider"></div>
                <div class="uniform-card-desc" title="${s.queHace}">${s.queHace}</div>
                <div class="uniform-card-industry"><b>Industria:</b> ${s.industria}</div>
            </div>
            <div class="uniform-card-footer">
                <button class="btn-outline card-btn btn-ver-ficha">Ver Ficha Técnica</button>
                <button class="btn-primary card-btn btn-pedir-contacto" style="background-color: ${tipo === 'STARTUP' ? 'var(--cidere-green-bright)' : 'var(--cidere-blue)'};">Contacto</button>
            </div>
        `;

        card.querySelector('.btn-ver-ficha').addEventListener('click', () => abrirFichaTecnica(s));
        card.querySelector('.btn-pedir-contacto').addEventListener('click', () => solicitarContacto(s.contacto, s.nombre));
        contenedor.appendChild(card);
    });
}

function abrirFichaTecnica(item) {
    document.getElementById('ficha-nombre').innerText = item.nombre;
    document.getElementById('ficha-tipo-badge').innerText = item.tipo === 'Startup' ? 'STARTUP' : 'CAPACIDAD REGIONAL';
    document.getElementById('ficha-institucion').innerText = item.institucion || (item.tipo === 'Startup' ? 'Emprendimiento Independiente' : 'No especificada');
    document.getElementById('ficha-que-hace').innerText = item.queHace || 'Sin información disponible';
    document.getElementById('ficha-como-hace').innerText = item.comoHace || 'Tecnología base en evaluación';
    document.getElementById('ficha-industria').innerText = item.industria;
    document.getElementById('ficha-contacto').innerText = item.contacto || 'Privado (Vía CIDERE)';
    document.getElementById('ficha-trl-val').innerText = item.trlMax === "Por validar" ? "Por validar" : `Nivel TRL ${item.trlMax}`;

    document.getElementById('ficha-btn-contacto').onclick = () => {
        closeModal('modal-ficha-tecnica');
        solicitarContacto(item.contacto, item.nombre);
    };

    openModal('modal-ficha-tecnica');
}

async function solicitarContacto(email, nombre, solicitanteEmpresa = "Empresa Socia", solicitanteEmail = "No especificado", origen = "Ficha Técnica", solicitanteNombre = "No especificado") {
    if (!email || email === 'No disponible' || !email.trim()) {
        alert("Esta entidad no posee un correo público registrado.");
        return;
    }
    
    const fd = new FormData();
    fd.append('tipoFormulario', 'Contacto');
    fd.append('correoDestino', email);
    fd.append('nombreStartup', nombre);
    fd.append('solicitanteNombre', solicitanteNombre);
    fd.append('solicitanteEmpresa', solicitanteEmpresa);
    fd.append('solicitanteEmail', solicitanteEmail);
    fd.append('origen', origen);

    try {
        await postToAppsScript(fd);
        alert(`¡Solicitud enviada exitosamente! Se notificó a CIDERE Biobío y a ${nombre}.`);
    } catch (e) {
        alert("Error al procesar la vinculación.");
    }
}

// SPOTLIGHT PREDICTIVO
function initBuscadorSpotlight() {
    const input = document.getElementById('buscador-global');
    const dropdown = document.getElementById('search-dropdown-results');
    let timer;

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const q = normalizar(input.value);
            if (q.length < 2) {
                dropdown.innerHTML = '';
                dropdown.classList.remove('active');
                aplicarFiltrosCombine();
                return;
            }

            const resStartups = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'STARTUP' && (
                normalizar(s.nombre).includes(q) || normalizar(s.queHace).includes(q) || normalizar(s.industria).includes(q)
            )).slice(0, 4);

            const resIES = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'IES' && (
                normalizar(s.nombre).includes(q) || normalizar(s.queHace).includes(q) || normalizar(s.institucion).includes(q) || normalizar(s.industria).includes(q)
            )).slice(0, 4);

            if (resStartups.length === 0 && resIES.length === 0) {
                dropdown.innerHTML = `<div class="search-no-results">No se encontraron resultados para "<b>${input.value}</b>"</div>`;
                dropdown.classList.add('active');
                return;
            }

            let html = '';
            if (resIES.length > 0) {
                html += `<div class="search-group-title">Capacidades Regionales</div>`;
                resIES.forEach(item => {
                    html += `
                        <div class="search-item" data-name="${item.nombre}" data-view="view-ies">
                            <div class="search-item-info">
                                <div class="search-item-title">${item.nombre}</div>
                                <div class="search-item-sub">${item.institucion ? item.institucion + ' • ' : ''}${item.queHace}</div>
                            </div>
                            <span class="badge badge-blue">CAPACIDAD</span>
                        </div>
                    `;
                });
            }
            if (resStartups.length > 0) {
                html += `<div class="search-group-title">Startups Regionales</div>`;
                resStartups.forEach(item => {
                    html += `
                        <div class="search-item" data-name="${item.nombre}" data-view="view-repositorio">
                            <div class="search-item-info">
                                <div class="search-item-title">${item.nombre}</div>
                                <div class="search-item-sub">${item.industria} • ${item.queHace}</div>
                            </div>
                            <span class="badge badge-green">STARTUP</span>
                        </div>
                    `;
                });
            }

            dropdown.innerHTML = html;
            dropdown.classList.add('active');
            refreshIcons();

            dropdown.querySelectorAll('.search-item').forEach(el => {
                el.addEventListener('click', () => {
                    dropdown.classList.remove('active');
                    switchView(el.getAttribute('data-view'));
                    const item = startupsRegistry.find(s => s.nombre === el.getAttribute('data-name'));
                    if (item) abrirFichaTecnica(item);
                });
            });

            aplicarFiltrosCombine();
        }, 180);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dropdown.classList.remove('active');
            const q = normalizar(input.value);
            if (!q) return;
            const matchIES = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'IES' && normalizar(s.nombre).includes(q)).length;
            const matchS = startupsRegistry.filter(s => s.tipo.toUpperCase() === 'STARTUP' && normalizar(s.nombre).includes(q)).length;
            switchView(matchIES > matchS ? 'view-ies' : 'view-repositorio');
            aplicarFiltrosCombine();
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// CUESTIONARIO TRL
function initTRL() {
    const select = document.getElementById('select-empresa-trl');
    select.addEventListener('change', (e) => {
        empresaSeleccionadaActual = startupsRegistry.find(s => s.nombre === e.target.value) || null;
        document.getElementById('trl-empresa-titulo-lineal').innerText = empresaSeleccionadaActual ? `Evaluación de: ${empresaSeleccionadaActual.nombre}` : "Seleccione un Proyecto";
        renderTRL();
    });
    renderTRL();
}

function actualizarSelectTRL() {
    const select = document.getElementById('select-empresa-trl');
    select.innerHTML = `<option value="">-- Seleccione un proyecto registrado --</option>`;
    startupsRegistry.forEach(s => {
        select.innerHTML += `<option value="${s.nombre}">${s.nombre} (${s.industria})</option>`;
    });
}

function renderTRL() {
    const cont = document.getElementById('cuestionario-lineal-container');
    cont.innerHTML = '';
    const currentVal = empresaSeleccionadaActual ? (parseInt(empresaSeleccionadaActual.trlMax) || 1) : 1;

    trlDefinitions.forEach(step => {
        const isCompleted = step.level <= currentVal;
        const card = document.createElement('div');
        card.className = `trl-step-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="trl-step-header">
                <div>
                    <span class="badge ${isCompleted ? 'badge-green' : 'badge-gray'}">NIVEL ${step.level}</span>
                    <h4 style="font-size: 14px; margin-top: 4px;">${step.title}</h4>
                </div>
                <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;" ${isCompleted ? 'checked' : ''}>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">${step.desc}</p>
        `;

        card.querySelector('input').addEventListener('change', (e) => {
            if (!empresaSeleccionadaActual) { alert("Seleccione primero un proyecto."); renderTRL(); return; }
            empresaSeleccionadaActual.trlMax = e.target.checked ? Math.max(currentVal, step.level) : Math.max(1, step.level - 1);
            renderTRL();
        });

        cont.appendChild(card);
    });

    document.getElementById('trl-score-num').innerText = empresaSeleccionadaActual ? empresaSeleccionadaActual.trlMax : '1';
    refreshIcons();
}

// MODALES Y FORMULARIOS
function initModalesFormularios() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.getAttribute('data-modal'));
        });
    });

    const regTipo = document.getElementById('reg-tipo');
    const instContainer = document.getElementById('campo-institucion-container');
    const regInst = document.getElementById('reg-institucion');

    regTipo.addEventListener('change', () => {
        if (regTipo.value === 'IES') {
            instContainer.style.display = 'block';
            regInst.required = true;
        } else {
            instContainer.style.display = 'none';
            regInst.required = false;
            regInst.value = '';
        }
    });

    document.getElementById('form-registro-capacidad').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loader = document.getElementById('loader-capacidad');
        loader.style.display = 'inline';

        const fd = new FormData();
        fd.append('tipoFormulario', 'Capacidad');
        fd.append('tipoEntidad', regTipo.value);
        fd.append('institucion', regInst.value);
        fd.append('nombreProyecto', document.getElementById('reg-nombre').value);
        fd.append('industria', document.getElementById('reg-industria').value);
        fd.append('queHace', document.getElementById('reg-que-hace').value);
        fd.append('comoHace', document.getElementById('reg-como-hace').value);
        fd.append('trlActual', document.getElementById('reg-trl').value);
        fd.append('contactoEmail', document.getElementById('reg-contacto').value);

        try {
            await postToAppsScript(fd);
            alert("¡Solicitud enviada con éxito! Quedará registrada como 'Pendiente' en la base de datos.");
            closeModal('modal-subir-capacidad');
            e.target.reset();
        } catch (err) {
            alert("Error al conectar con el servidor.");
        } finally {
            loader.style.display = 'none';
        }
    });

    // FLUJO: PUBLICAR DESAFÍO + MATCHMAKING INMEDIATO
    document.getElementById('form-publicar-desafio').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loader = document.getElementById('loader-desafio');
        loader.style.display = 'inline';

        const solicitanteNombre = document.getElementById('des-solicitante').value.trim();
        const empresa = document.getElementById('des-empresa').value.trim();
        const contactoEmail = document.getElementById('des-contacto').value.trim();
        const rubro = document.getElementById('des-rubro').value.trim();
        const nivelRiesgo = document.getElementById('des-riesgo').value.trim();
        const titulo = document.getElementById('des-titulo').value.trim();

        const desc = "1. CONTEXTO:\n" + document.getElementById('des-contexto').value + 
                     "\n\n2. IMPACTO ESPERADO:\n" + document.getElementById('des-impacto').value + 
                     "\n\n3. RESTRICCIONES:\n" + document.getElementById('des-restricciones').value;

        const fd = new FormData();
        fd.append('tipoFormulario', 'Desafio');
        fd.append('solicitanteNombre', solicitanteNombre);
        fd.append('empresa', empresa);
        fd.append('contactoEmail', contactoEmail);
        fd.append('rubro', rubro);
        fd.append('nivelRiesgo', nivelRiesgo);
        fd.append('titulo', titulo);
        fd.append('descripcion', desc);

        try {
            await postToAppsScript(fd);
        } catch (err) {
            console.warn("Continuando al análisis de matches locales tras registrar desafío...", err);
        } finally {
            loader.style.display = 'none';
        }

        // Ejecutar algoritmo de Matchmaking y mostrar resultados
        mostrarPantallaMatches(empresa, contactoEmail, rubro, nivelRiesgo, titulo, solicitanteNombre);
    });
}

function abrirModalDesafio() {
    const form = document.getElementById('form-publicar-desafio');
    const matchesView = document.getElementById('desafio-matches-container');
    const title = document.getElementById('modal-desafio-title');

    form.reset();
    form.style.display = 'block';
    matchesView.style.display = 'none';
    title.innerText = 'Estructurador de Desafíos';
    openModal('modal-publicar-desafio');
}

function mostrarPantallaMatches(empresa, contactoEmail, rubro, nivelRiesgo, tituloDesafio, solicitanteNombre) {
    const form = document.getElementById('form-publicar-desafio');
    const matchesView = document.getElementById('desafio-matches-container');
    const title = document.getElementById('modal-desafio-title');
    const contenedorLista = document.getElementById('desafio-matches-lista');

    form.style.display = 'none';
    matchesView.style.display = 'block';
    title.innerText = 'Matches & Soluciones del Ecosistema';

    // Rango TRL según nivel de riesgo seleccionado
    let minTrl = 1, maxTrl = 9;
    if (nivelRiesgo.includes('1-3')) { minTrl = 1; maxTrl = 3; }
    else if (nivelRiesgo.includes('4-6')) { minTrl = 4; maxTrl = 6; }
    else if (nivelRiesgo.includes('7-9')) { minTrl = 7; maxTrl = 9; }

    // Filtrar entidades que coincidan con la industria
    const matchesMismaIndustria = startupsRegistry.filter(s => normalizar(s.industria) === normalizar(rubro));

    // Ordenar: primero los que caen dentro del rango TRL preferido
    matchesMismaIndustria.sort((a, b) => {
        const trlA = parseInt(a.trlMax) || 0;
        const trlB = parseInt(b.trlMax) || 0;
        const enRangoA = trlA >= minTrl && trlA <= maxTrl ? 1 : 0;
        const enRangoB = trlB >= minTrl && trlB <= maxTrl ? 1 : 0;
        return enRangoB - enRangoA;
    });

    contenedorLista.innerHTML = '';

    if (matchesMismaIndustria.length === 0) {
        contenedorLista.innerHTML = `
            <div style="text-align: center; padding: 28px 16px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 10px;">
                <i data-lucide="search-x" size="36" style="color: var(--cidere-blue); opacity: 0.5; margin-bottom: 8px;"></i>
                <h4 style="font-size: 15px; color: var(--cidere-blue); font-weight: 700;">No hay matches públicos inmediatos en ${rubro}</h4>
                <p style="font-size: 12.5px; color: var(--text-muted); max-width: 500px; margin: 4px auto 0; line-height: 1.5;">
                    Tu desafío ha quedado guardado en la hoja Desafios_Postulados de la Mesa de Innovación. El equipo de CIDERE Biobío buscará capacidades complementarias con universidades y centros de I+D fuera del catálogo público y se pondrá en contacto contigo.
                </p>
            </div>
        `;
    } else {
        matchesMismaIndustria.slice(0, 6).forEach(item => {
            const trlVal = parseInt(item.trlMax) || 0;
            const compatibleTrl = trlVal >= minTrl && trlVal <= maxTrl;
            const badgeTipo = item.tipo === 'Startup' ? 'badge-green' : 'badge-blue';
            const etiquetaTipo = item.tipo === 'Startup' ? 'STARTUP' : 'CAPACIDAD REGIONAL';

            const card = document.createElement('div');
            card.className = 'match-card-item';
            card.innerHTML = `
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                        <span class="badge ${badgeTipo}">${etiquetaTipo}</span>
                        <span class="badge badge-gray">TRL ${item.trlMax}</span>
                        ${compatibleTrl ? '<span class="badge badge-green" style="background: #ecfdf5; color: #047857;">ALINEADO AL RIESGO</span>' : ''}
                    </div>
                    <div class="match-info-title">${item.nombre}</div>
                    <div class="match-info-meta">
                        ${item.institucion ? `<b>Institución:</b> ${item.institucion} &bull; ` : ''}
                        <b>Industria:</b> ${item.industria}
                    </div>
                    <div class="match-info-desc">${item.queHace}</div>
                </div>
                <div style="flex-shrink: 0;">
                    <button class="btn-primary btn-match-contacto" style="background-color: var(--cidere-green-bright); padding: 8px 16px; font-weight: 700; white-space: nowrap;">
                        Solicitar Contacto
                    </button>
                </div>
            `;

            const btnContacto = card.querySelector('.btn-match-contacto');
            btnContacto.addEventListener('click', async () => {
                btnContacto.disabled = true;
                btnContacto.innerText = 'Registrando...';

                const fdContacto = new FormData();
                fdContacto.append('tipoFormulario', 'Contacto');
                fdContacto.append('solicitanteNombre', solicitanteNombre);
                fdContacto.append('solicitanteEmpresa', empresa);
                fdContacto.append('solicitanteEmail', contactoEmail);
                fdContacto.append('nombreStartup', item.nombre);
                fdContacto.append('correoDestino', item.contacto || 'No disponible');
                fdContacto.append('origen', `Match desde Desafío: ${tituloDesafio}`);

                try {
                    await postToAppsScript(fdContacto);
                    btnContacto.style.backgroundColor = '#10b981';
                    btnContacto.innerHTML = '<i data-lucide="check" size="14"></i> Contacto Solicitado';
                    refreshIcons();
                } catch (e) {
                    btnContacto.disabled = false;
                    btnContacto.innerText = 'Solicitar Contacto';
                    alert("Error al registrar solicitud de contacto.");
                }
            });

            contenedorLista.appendChild(card);
        });
    }

    refreshIcons();
}

function abrirModalCapacidad(tipo) {
    const form = document.getElementById('form-registro-capacidad');
    form.reset();
    document.getElementById('reg-tipo').value = tipo;
    document.getElementById('modal-form-titulo').innerText = tipo === 'IES' ? 'Registrar Capacidad Regional' : 'Registrar Nueva Startup';
    document.getElementById('campo-institucion-container').style.display = tipo === 'IES' ? 'block' : 'none';
    openModal('modal-subir-capacidad');
}

// CARRUSEL
function initCarrusel() {
    let index = 0;
    setInterval(() => {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length > 0) {
            slides[index].style.opacity = '0';
            if (dots.length > 0) {
                dots[index].style.background = 'var(--border-color)';
                dots[index].classList.remove('active');
            }
            index = (index + 1) % slides.length;
            slides[index].style.opacity = '1';
            if (dots.length > 0) {
                dots[index].style.background = 'var(--cidere-blue)';
                dots[index].classList.add('active');
            }
        }
    }, 5000);
}
