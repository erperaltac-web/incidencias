/* ==========================================================================
   SINFONIA - SISTEMA DE GESTIÓN DE INCIDENCIAS - APP.JS
   Core logic: SPA View Router, API / LocalStorage Toggle,
   Duplicate Detector, Sound Notifications & IT Action Modals.
   ========================================================================== */

// 1. MOCK SEED DATA FOR DEMO MODE
const DEFAULT_USERS = [
    { id: 1, username: 'docente1', password: 'docente123', nombre: 'Dr. Juan Pérez', role: 'DOCENTE', email: 'juan.perez@universidad.edu' },
    { id: 2, username: 'docente2', password: 'docente123', nombre: 'Dra. María Gómez', role: 'DOCENTE', email: 'maria.gomez@universidad.edu' },
    { id: 3, username: 'tecnico1', password: 'ti123', nombre: 'Ing. Carlos Dávila (Redes)', role: 'TI', email: 'carlos.davila@universidad.edu' },
    { id: 4, username: 'tecnico2', password: 'ti123', nombre: 'Soporte General (Hardware)', role: 'TI', email: 'soporte.ti@universidad.edu' },
    { id: 5, username: 'admin', password: 'admin123', nombre: 'Administrador General', role: 'ADMINISTRADOR', email: 'admin@universidad.edu' }
];

const DEFAULT_INCIDENCIAS = [
    {
        id: 1,
        titulo: "Proyector no enciende",
        descripcion: "El proyector del aula no responde al control remoto ni al botón físico. Luz roja parpadeante.",
        categoria: "HARDWARE",
        aula: "Aula 302 - Edificio B",
        estado: "PENDIENTE",
        fechaCreacion: new Date(Date.now() - 3600000 * 5).toISOString(), // Hace 5 horas
        creador: DEFAULT_USERS[0],
        tecnico: null,
        justificacion: null
    },
    {
        id: 2,
        titulo: "Sin conexión a Internet",
        descripcion: "Las PCs de la fila central no obtienen dirección IP y el cable de red parece estar en buen estado.",
        categoria: "REDES",
        aula: "Laboratorio 105 - Edificio de Sistemas",
        estado: "ATENDIENDO",
        fechaCreacion: new Date(Date.now() - 3600000 * 24).toISOString(), // Hace 1 día
        creador: DEFAULT_USERS[1],
        tecnico: DEFAULT_USERS[2],
        justificacion: null
    },
    {
        id: 3,
        titulo: "Licencia de software vencida",
        descripcion: "El software MATLAB muestra error de licencia expirada al intentar iniciar sesión.",
        categoria: "SOFTWARE",
        aula: "Laboratorio de Cómputo Avanzado",
        estado: "FINALIZADO",
        fechaCreacion: new Date(Date.now() - 3600000 * 48).toISOString(), // Hace 2 días
        creador: DEFAULT_USERS[0],
        tecnico: DEFAULT_USERS[2],
        justificacion: "Se actualizaron las licencias en el servidor central de licencias de la universidad.",
        fechaResolucion: new Date(Date.now() - 3600000 * 46).toISOString() // Hace 46 horas
    }
];

// Spanish stop words for Jaccard Similarity algorithm
const STOP_WORDS = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "en", "y", "o", "no", "se", "para", "con", "por", "que", "es", "esta"
]);

// 2. STATE CONFIGURATION
let currentUser = null;
let isDemoMode = true; // Default true to allow instant double-click preview
let pollingInterval = null;
let knownIncidentIds = new Set(); // Track pending incidents to avoid duplicate notifications

// Base API URL (Spring Boot server address)
const API_BASE = "http://localhost:8080/api";

// 3. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    // Populate localStorage seeds if empty
    if (!localStorage.getItem("sinfonia_users")) {
        localStorage.setItem("sinfonia_users", JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem("sinfonia_incidencias")) {
        localStorage.setItem("sinfonia_incidencias", JSON.stringify(DEFAULT_INCIDENCIAS));
    }

    // Auto-detect backend connection on load
    detectBackend();

    // Event Listeners Setup
    setupEventListeners();
    
    // Check if session exists
    checkSession();
});

// Detect if Spring Boot backend is running
async function detectBackend() {
    try {
        const res = await fetch(`${API_BASE}/incidencias/notificaciones`, { method: 'GET', signal: AbortSignal.timeout(1000) });
        if (res.ok) {
            setMode(false); // Switch to API mode since backend is live!
            showToast("Servidor Activo", "Conectado al backend de Java (Spring Boot) en el puerto 8080.", "success");
        } else {
            throw new Error();
        }
    } catch (e) {
        setMode(true); // Default to local demo mode
    }
}

// Adjust UI mode (Demo vs API)
function setMode(demo) {
    isDemoMode = demo;
    const toggle = document.getElementById("demoToggle");
    const dot = document.getElementById("demoDot");
    const label = document.getElementById("demoModeLabel");
    
    toggle.checked = demo;
    if (demo) {
        dot.classList.remove("online");
        label.innerText = "Modo Demo Activo";
    } else {
        dot.classList.add("online");
        label.innerText = "Conectado a Servidor Java";
    }
}

// 4. ROUTER / VIEW ENGINE
function checkSession() {
    const savedUser = localStorage.getItem("sinfonia_current_user");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById("mainHeader").style.display = "none";
    document.getElementById("docenteDashboard").style.display = "none";
    document.getElementById("tiDashboard").style.display = "none";
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("loginSection").style.display = "flex";
    
    // Clear notifications polling
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function showDashboard() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("mainHeader").style.display = "flex";
    
    // Set user profile badge info
    document.getElementById("profileName").innerText = currentUser.nombre;
    document.getElementById("profileRole").innerText = getRoleLabel(currentUser.role);
    
    // Render the specific view for each role
    const docDash = document.getElementById("docenteDashboard");
    const tiDash = document.getElementById("tiDashboard");
    const adminDash = document.getElementById("adminDashboard");
    const bellContainer = document.getElementById("notifBellContainer");

    docDash.style.display = "none";
    tiDash.style.display = "none";
    adminDash.style.display = "none";
    bellContainer.style.display = "none";

    if (currentUser.role === "DOCENTE") {
        docDash.style.display = "block";
        loadDocenteIncidencias();
    } else if (currentUser.role === "TI") {
        tiDash.style.display = "block";
        bellContainer.style.display = "block";
        loadTiIncidencias();
        startPollingForTi();
    } else if (currentUser.role === "ADMINISTRADOR") {
        adminDash.style.display = "block";
        loadAdminIncidencias();
    }
}

function getRoleLabel(role) {
    if (role === "DOCENTE") return "Docente";
    if (role === "TI") return "Soporte TI";
    if (role === "ADMINISTRADOR") return "Administrador";
    return role;
}

// 5. EVENT LISTENERS
function setupEventListeners() {
    // Mode Switch Toggle
    document.getElementById("demoToggle").addEventListener("change", (e) => {
        if (e.target.checked) {
            setMode(true);
            showToast("Modo Demo", "Operando en base de datos local del navegador.", "warning");
            if (currentUser) showDashboard();
        } else {
            // Attempt to connect to server
            testConnectionAndSwitch();
        }
    });

    // Quick Login buttons
    document.querySelectorAll(".btn-quick-role").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const button = e.currentTarget;
            document.getElementById("username").value = button.dataset.user;
            document.getElementById("password").value = button.dataset.pass;
            // Visual feedback
            button.style.transform = "scale(0.95)";
            setTimeout(() => button.style.transform = "", 150);
        });
    });

    // Login Form Submit
    document.getElementById("loginForm").addEventListener("submit", handleLogin);

    // Logout Button
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("sinfonia_current_user");
        currentUser = null;
        showLogin();
        showToast("Sesión Cerrada", "Has salido del sistema con éxito.", "success");
    });

    // Create Incident Form (Docente)
    document.getElementById("incidenciaForm").addEventListener("submit", handleCreateIncidencia);
    
    // Live Duplicate Checking trigger (on blur of Title or Description)
    const titleInput = document.getElementById("incTitulo");
    const descInput = document.getElementById("incDescripcion");
    const catInput = document.getElementById("incCategoria");

    const checkTrigger = () => {
        if (titleInput.value.length > 5 && catInput.value && descInput.value.length > 5) {
            runDuplicateCheck(titleInput.value, descInput.value, catInput.value);
        }
    };

    titleInput.addEventListener("blur", checkTrigger);
    descInput.addEventListener("blur", checkTrigger);
    catInput.addEventListener("change", checkTrigger);

    // Duplicate alert actions
    document.getElementById("cancelReportBtn").addEventListener("click", () => {
        document.getElementById("incidenciaForm").reset();
        document.getElementById("duplicateAlert").style.display = "none";
        showToast("Reporte Cancelado", "Se descartó el formulario para evitar duplicidad.", "warning");
    });

    document.getElementById("forceReportBtn").addEventListener("click", () => {
        // Hide duplicates alert panel and submit
        document.getElementById("duplicateAlert").style.display = "none";
        submitIncidenciaDirectly();
    });

    // TI Filters
    document.querySelectorAll("#tiDashboard .btn-filter").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll("#tiDashboard .btn-filter").forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            loadTiIncidencias(e.currentTarget.dataset.filter);
        });
    });

    // Admin Filters
    document.querySelectorAll("#adminDashboard .btn-filter").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll("#adminDashboard .btn-filter").forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            loadAdminIncidencias(e.currentTarget.dataset.filter);
        });
    });

    // IT Notification Bell dropdown toggle
    const notifBtn = document.getElementById("notifBtn");
    const dropdown = document.getElementById("notifDropdown");
    
    notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifBtn.classList.remove("ring");
        dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", () => {
        dropdown.style.display = "none";
    });

    document.getElementById("clearNotifBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        document.getElementById("notifList").innerHTML = '<div class="notif-empty">Sin nuevas notificaciones</div>';
        document.getElementById("notifCount").innerText = "0";
        document.getElementById("notifCount").style.display = "none";
    });

    // Close Modal button
    document.getElementById("modalCloseBtn").addEventListener("click", () => {
        document.getElementById("actionModal").style.display = "none";
    });
    document.getElementById("modalCancelBtn").addEventListener("click", () => {
        document.getElementById("actionModal").style.display = "none";
    });

    // Modal submit handler
    document.getElementById("modalForm").addEventListener("submit", handleModalSubmit);
}

// Test Java Backend and switch if successful
async function testConnectionAndSwitch() {
    try {
        const res = await fetch(`${API_BASE}/incidencias/notificaciones`, { method: 'GET', signal: AbortSignal.timeout(1500) });
        if (res.ok) {
            setMode(false);
            showToast("Conexión Exitosa", "Conectado al servidor de Spring Boot.", "success");
            if (currentUser) showDashboard();
        } else {
            throw new Error();
        }
    } catch (e) {
        setMode(true);
        showToast("Error de Servidor", "No se pudo conectar al servidor Java (Spring Boot) en el puerto 8080. Se mantendrá el Modo Demo local.", "danger");
    }
}

// 6. LOGIN LOGIC
async function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("username").value.trim();
    const passVal = document.getElementById("password").value.trim();
    const errorAlert = document.getElementById("loginError");
    
    errorAlert.style.display = "none";
    
    if (isDemoMode) {
        // Local Validation
        const users = JSON.parse(localStorage.getItem("sinfonia_users"));
        const found = users.find(u => u.username === userVal && u.password === passVal);
        
        if (found) {
            currentUser = { ...found };
            delete currentUser.password; // Do not save password in state
            localStorage.setItem("sinfonia_current_user", JSON.stringify(currentUser));
            showDashboard();
            showToast(`¡Bienvenido!`, `Sesión iniciada como ${currentUser.nombre}.`, "success");
        } else {
            showLoginError("Credenciales incorrectas en el simulador local.");
        }
    } else {
        // API Authentication Call
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: userVal, password: passVal })
            });

            if (res.ok) {
                currentUser = await res.json();
                localStorage.setItem("sinfonia_current_user", JSON.stringify(currentUser));
                showDashboard();
                showToast(`¡Bienvenido!`, `Conectado como ${currentUser.nombre} en el servidor.`, "success");
            } else {
                const data = await res.json();
                showLoginError(data.message || "Usuario o contraseña inválidos.");
            }
        } catch (err) {
            showLoginError("Error al contactar al servidor. Revisa si Spring Boot está activo.");
        }
    }
}

function showLoginError(msg) {
    const errorAlert = document.getElementById("loginError");
    const errorMsg = document.getElementById("loginErrorMessage");
    errorMsg.innerText = msg;
    errorAlert.style.display = "flex";
}

// 7. DUPLICATE DETECTOR LOGIC (Core request requirement)
async function runDuplicateCheck(titulo, descripcion, categoria) {
    const dupAlert = document.getElementById("duplicateAlert");
    const dupList = document.getElementById("duplicateList");
    
    if (isDemoMode) {
        // Client-side Jaccard similarity implementation
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        
        // Filter open incidents in the same category
        const activas = incidencias.filter(i => 
            i.categoria === categoria && ["PENDIENTE", "ATENDIENDO"].includes(i.estado)
        );

        const duplicates = activas.filter(i => {
            const score = calculateJaccardScore(titulo, descripcion, i.titulo, i.descripcion);
            return score >= 0.38; // Threshold
        });

        if (duplicates.length > 0) {
            renderDuplicateAlert(duplicates);
        } else {
            dupAlert.style.display = "none";
        }
    } else {
        // Call Java Backend duplicates endpoint
        try {
            const res = await fetch(`${API_BASE}/incidencias/verificar-duplicado`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo, descripcion, categoria })
            });

            if (res.ok) {
                const duplicates = await res.json();
                if (duplicates.length > 0) {
                    renderDuplicateAlert(duplicates);
                } else {
                    dupAlert.style.display = "none";
                }
            }
        } catch (e) {
            console.error("Error checking duplicates from backend server.", e);
        }
    }
}

// Tokenize text and compute Jaccard score (similar to our Java service)
function calculateJaccardScore(t1, d1, t2, d2) {
    const getTokens = (str) => {
        if (!str) return new Set();
        const clean = str.toLowerCase()
            .replace(/[^a-záéíóúüñ0-9\s]/g, " ")
            .replace(/\s+/g, " ");
        
        const set = new Set();
        clean.split(" ").forEach(w => {
            const trimmed = w.trim();
            if (trimmed.length > 2 && !STOP_WORDS.has(trimmed)) {
                set.add(trimmed);
            }
        });
        return set;
    };

    const simScore = (setA, setB) => {
        if (setA.size === 0 || setB.size === 0) return 0.0;
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        return intersection.size / union.size;
    };

    const titleSim = simScore(getTokens(t1), getTokens(t2));
    const descSim = simScore(getTokens(d1), getTokens(d2));

    // Weighted similarity: 70% title, 30% description
    return (titleSim * 0.7) + (descSim * 0.3);
}

function renderDuplicateAlert(duplicates) {
    const dupAlert = document.getElementById("duplicateAlert");
    const dupList = document.getElementById("duplicateList");
    
    dupList.innerHTML = "";
    duplicates.forEach(d => {
        const item = document.createElement("div");
        item.className = "dup-card-item";
        item.innerHTML = `
            <div class="dup-card-item-title">${escapeHtml(d.titulo)}</div>
            <div class="dup-card-item-meta">
                <span><i class="fa-solid fa-door-open"></i> ${escapeHtml(d.aula)}</span> • 
                <span><i class="fa-solid fa-user"></i> ${escapeHtml(d.creador.nombre)}</span> • 
                <span class="badge ${d.estado === 'PENDIENTE' ? 'badge-pendiente' : 'badge-atendiendo'}">${d.estado}</span>
            </div>
        `;
        dupList.appendChild(item);
    });

    dupAlert.style.display = "flex";
    // Scroll warning into view smoothly
    dupAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 8. DOCENTE DASHBOARD OPERATIONS
async function handleCreateIncidencia(e) {
    e.preventDefault();
    const dupAlert = document.getElementById("duplicateAlert");
    
    // If warning panel is visible, do not submit yet (make user click Force or Cancel)
    if (dupAlert.style.display === "flex") {
        showToast("Verificación de Duplicados", "Por favor revisa las alertas antes de continuar.", "warning");
        return;
    }

    submitIncidenciaDirectly();
}

async function submitIncidenciaDirectly() {
    const payload = {
        titulo: document.getElementById("incTitulo").value.trim(),
        categoria: document.getElementById("incCategoria").value,
        aula: document.getElementById("incAula").value.trim(),
        descripcion: document.getElementById("incDescripcion").value.trim(),
        creadorId: currentUser.id
    };

    if (isDemoMode) {
        // Demo Mode Save
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        const newInc = {
            id: Date.now(),
            ...payload,
            estado: "PENDIENTE",
            fechaCreacion: new Date().toISOString(),
            creador: currentUser,
            tecnico: null,
            justificacion: null
        };

        incidencias.unshift(newInc);
        localStorage.setItem("sinfonia_incidencias", JSON.stringify(incidencias));
        
        document.getElementById("incidenciaForm").reset();
        document.getElementById("duplicateAlert").style.display = "none";
        loadDocenteIncidencias();
        showToast("Éxito", "Reporte de incidencia enviado a la bandeja de TI.", "success");
    } else {
        // API Call Save
        try {
            const res = await fetch(`${API_BASE}/incidencias`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                document.getElementById("incidenciaForm").reset();
                document.getElementById("duplicateAlert").style.display = "none";
                loadDocenteIncidencias();
                showToast("Éxito", "Incidencia registrada correctamente en el servidor Java.", "success");
            } else {
                const err = await res.json();
                showToast("Error", err.message || "Fallo al guardar reporte.", "danger");
            }
        } catch (e) {
            showToast("Servidor Caído", "No se pudo comunicar con el backend. Intenta en Modo Demo.", "danger");
        }
    }
}

async function loadDocenteIncidencias() {
    const listContainer = document.getElementById("docenteIncidenciasList");
    
    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        // Filter user reported incidents
        const misInc = incidencias.filter(i => i.creador.id === currentUser.id);
        renderIncidenciaList(misInc, listContainer, false);
    } else {
        try {
            const res = await fetch(`${API_BASE}/incidencias?creadorId=${currentUser.id}`);
            if (res.ok) {
                const list = await res.json();
                renderIncidenciaList(list, listContainer, false);
            }
        } catch (e) {
            listContainer.innerHTML = '<div class="list-empty text-red"><i class="fa-solid fa-circle-exclamation"></i> Error al cargar datos del servidor.</div>';
        }
    }
}

// Render dynamic lists of incidents
function renderIncidenciaList(list, container, isTechnicalView = false) {
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = '<div class="list-empty">No hay incidencias que coincidan con este estado.</div>';
        return;
    }

    list.forEach(i => {
        const card = document.createElement("div");
        card.className = "incidencia-card glass-panel fade-in";
        
        // Dynamic border color based on status
        if (i.estado === "PENDIENTE") card.style.borderColor = "var(--color-warning)";
        else if (i.estado === "ATENDIENDO") card.style.borderColor = "var(--color-primary)";
        else if (i.estado === "FINALIZADO") card.style.borderColor = "var(--color-green)";
        else if (i.estado === "RECHAZADO") card.style.borderColor = "var(--color-red)";

        const stateBadge = `<span class="badge ${getStateBadgeClass(i.estado)}">${i.estado}</span>`;
        
        let actionsHtml = "";
        // If technical view, show action button bar
        if (isTechnicalView) {
            if (i.estado === "PENDIENTE") {
                actionsHtml = `
                    <div class="inc-card-actions">
                        <button class="btn-card-action btn-action-attend" onclick="changeStatus(${i.id}, 'ATENDIENDO')">
                            <i class="fa-solid fa-screwdriver-wrench"></i> Atender
                        </button>
                    </div>
                `;
            } else if (i.estado === "ATENDIENDO") {
                actionsHtml = `
                    <div class="inc-card-actions">
                        <button class="btn-card-action btn-action-reject" onclick="openActionModal(${i.id}, 'REJECT', '${escapeHtml(i.titulo)}')">
                            <i class="fa-solid fa-ban"></i> Rechazar
                        </button>
                        <button class="btn-card-action btn-action-resolve" onclick="openActionModal(${i.id}, 'RESOLVE', '${escapeHtml(i.titulo)}')">
                            <i class="fa-solid fa-circle-check"></i> Finalizado
                        </button>
                    </div>
                `;
            }
        }

        // Justification render
        let justificacionHtml = "";
        const fechaResFormatted = i.fechaResolucion ? ` el ${formatDate(i.fechaResolucion)}` : "";
        if (i.estado === "FINALIZADO" && i.justificacion) {
            justificacionHtml = `
                <div class="inc-card-resolution">
                    <h5 class="text-success-title"><i class="fa-solid fa-clipboard-check"></i> Solucionado por ${escapeHtml(i.tecnico.nombre)}${fechaResFormatted}</h5>
                    <p>${escapeHtml(i.justificacion)}</p>
                </div>
            `;
        } else if (i.estado === "RECHAZADO" && i.justificacion) {
            justificacionHtml = `
                <div class="inc-card-resolution">
                    <h5 class="text-danger-title"><i class="fa-solid fa-ban"></i> Rechazado por ${escapeHtml(i.tecnico.nombre)}${fechaResFormatted}</h5>
                    <p>${escapeHtml(i.justificacion)}</p>
                </div>
            `;
        }

        // Construct card layout
        card.innerHTML = `
            <div class="inc-card-header">
                <div class="inc-title-wrapper">
                    <h4>${escapeHtml(i.titulo)}</h4>
                    <span class="inc-loc"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(i.aula)}</span>
                </div>
                ${stateBadge}
            </div>
            <p class="inc-desc">${escapeHtml(i.descripcion)}</p>
            ${justificacionHtml}
            <div class="inc-card-meta">
                <div class="inc-meta-left">
                    <span class="inc-cat-tag">${i.categoria}</span>
                    <span><i class="fa-solid fa-user"></i> Creador: ${escapeHtml(i.creador.nombre)}</span>
                </div>
                <div class="inc-meta-right">
                    <span>${formatDate(i.fechaCreacion)}</span>
                </div>
            </div>
            ${actionsHtml}
        `;

        container.appendChild(card);
    });
}

function getStateBadgeClass(status) {
    if (status === "PENDIENTE") return "badge-pendiente";
    if (status === "ATENDIENDO") return "badge-atendiendo";
    if (status === "FINALIZADO") return "badge-finalizado";
    if (status === "RECHAZADO") return "badge-rechazado";
    return "";
}

// 9. TI DASHBOARD OPERATIONS
async function loadTiIncidencias(statusFilter = "TODAS") {
    const listContainer = document.getElementById("tiIncidenciasList");
    
    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        let filtered = incidencias;
        if (statusFilter !== "TODAS") {
            filtered = incidencias.filter(i => i.estado === statusFilter);
        }
        
        renderIncidenciaList(filtered, listContainer, true);
        updateTiStats(incidencias);
    } else {
        try {
            const res = await fetch(`${API_BASE}/incidencias`);
            if (res.ok) {
                const list = await res.json();
                let filtered = list;
                if (statusFilter !== "TODAS") {
                    filtered = list.filter(i => i.estado === statusFilter);
                }
                renderIncidenciaList(filtered, listContainer, true);
                updateTiStats(list);
            }
        } catch (e) {
            listContainer.innerHTML = '<div class="list-empty text-red"><i class="fa-solid fa-circle-exclamation"></i> Error al conectar con el servidor central.</div>';
        }
    }
}

function updateTiStats(list) {
    document.getElementById("tiStatPendientes").innerText = list.filter(i => i.estado === "PENDIENTE").length;
    document.getElementById("tiStatAtendiendo").innerText = list.filter(i => i.estado === "ATENDIENDO").length;
    document.getElementById("tiStatFinalizados").innerText = list.filter(i => i.estado === "FINALIZADO").length;
    document.getElementById("tiStatRechazados").innerText = list.filter(i => i.estado === "RECHAZADO").length;
}

// Change state of incident (e.g. from PENDIENTE to ATENDIENDO)
async function changeStatus(id, newStatus, justificacion = null) {
    const payload = {
        estado: newStatus,
        tecnicoId: currentUser.id,
        justificacion: justificacion
    };

    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        const idx = incidencias.findIndex(i => i.id === id);
        
        if (idx !== -1) {
            incidencias[idx].estado = newStatus;
            incidencias[idx].tecnico = currentUser;
            incidencias[idx].justificacion = justificacion;
            if (newStatus === "FINALIZADO" || newStatus === "RECHAZADO") {
                incidencias[idx].fechaResolucion = new Date().toISOString();
            } else {
                incidencias[idx].fechaResolucion = null;
            }
            
            localStorage.setItem("sinfonia_incidencias", JSON.stringify(incidencias));
            
            showToast("Estado Actualizado", `Incidencia #${id} pasó a ${newStatus}.`, "success");
            loadTiIncidencias(getActiveTiFilter());
        }
    } else {
        try {
            const res = await fetch(`${API_BASE}/incidencias/${id}/estado`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast("Estado Actualizado", `Incidencia registrada en el servidor como ${newStatus}.`, "success");
                loadTiIncidencias(getActiveTiFilter());
            } else {
                const err = await res.json();
                showToast("Error", err.message || "Fallo al actualizar estado.", "danger");
            }
        } catch (e) {
            showToast("Error de Conexión", "No se pudo actualizar la incidencia en el servidor.", "danger");
        }
    }
}

function getActiveTiFilter() {
    const activeBtn = document.querySelector("#tiDashboard .btn-filter.active");
    return activeBtn ? activeBtn.dataset.filter : "TODAS";
}

// 10. REAL-TIME IT NOTIFICATIONS (Core requirement)
function startPollingForTi() {
    if (pollingInterval) clearInterval(pollingInterval);
    
    // Seed initial known IDs so we don't alert old incidents
    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        incidencias.forEach(i => knownIncidentIds.add(i.id));
    } else {
        fetch(`${API_BASE}/incidencias/notificaciones`)
            .then(res => res.json())
            .then(list => list.forEach(i => knownIncidentIds.add(i.id)))
            .catch(() => {});
    }

    // Set 5 seconds intervals
    pollingInterval = setInterval(async () => {
        if (currentUser && currentUser.role === "TI") {
            let pending = [];
            
            if (isDemoMode) {
                const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
                pending = incidencias.filter(i => i.estado === "PENDIENTE");
            } else {
                try {
                    const res = await fetch(`${API_BASE}/incidencias/notificaciones`);
                    if (res.ok) pending = await res.json();
                } catch (e) {
                    console.log("Polling connection failure.");
                    return;
                }
            }

            // Find new incidents not seen yet
            const newIncidents = pending.filter(i => !knownIncidentIds.has(i.id));
            if (newIncidents.length > 0) {
                newIncidents.forEach(ni => {
                    knownIncidentIds.add(ni.id);
                    triggerTiAlertNotification(ni);
                });
                
                // Refresh technical grid
                loadTiIncidencias(getActiveTiFilter());
            }
        }
    }, 5000);
}

// Triggers visual bell shake, plays notification sound, and shows a floating toast
function triggerTiAlertNotification(incidencia) {
    // 1. Shaking bell animation
    const bellBtn = document.getElementById("notifBtn");
    bellBtn.classList.remove("ring");
    void bellBtn.offsetWidth; // Trigger reflow to restart animation
    bellBtn.classList.add("ring");

    // 2. Play soft ping audio
    const audio = document.getElementById("notifSound");
    if (audio) {
        audio.play().catch(e => console.log("Audio autoplay prevented. Interaction required.", e));
    }

    // 3. Increment bell count badge
    const countBadge = document.getElementById("notifCount");
    const currentCount = parseInt(countBadge.innerText) || 0;
    const newCount = currentCount + 1;
    countBadge.innerText = newCount;
    countBadge.style.display = "flex";

    // 4. Inject notification item into dropdown list
    const notifList = document.getElementById("notifList");
    const emptyDiv = notifList.querySelector(".notif-empty");
    if (emptyDiv) emptyDiv.remove();

    const notifItem = document.createElement("div");
    notifItem.className = "notif-item";
    notifItem.innerHTML = `
        <div class="notif-item-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="notif-item-content">
            <h4>NUEVA INCIDENCIA</h4>
            <p><strong>${escapeHtml(incidencia.titulo)}</strong> en ${escapeHtml(incidencia.aula)}</p>
            <span class="notif-item-time">Creado por ${escapeHtml(incidencia.creador.nombre)}</span>
        </div>
    `;
    notifList.insertBefore(notifItem, notifList.firstChild);

    // 5. Trigger premium Toast Notification
    showToast(
        "Nueva Incidencia Recibida", 
        `Se ha reportado "${incidencia.titulo}" en el ${incidencia.aula}. Creador: ${incidencia.creador.nombre}`, 
        "warning"
    );
}

// 11. ACTION MODAL DIALOG MANAGEMENT (Resolving and Rejecting)
function openActionModal(id, actionType, titulo) {
    const modal = document.getElementById("actionModal");
    const title = document.getElementById("modalTitle");
    const submitBtnText = document.getElementById("modalBtnText");
    const label = document.getElementById("justificacionLabel");
    const summary = document.getElementById("modalIncidentSummary");
    
    document.getElementById("modalIncidenciaId").value = id;
    document.getElementById("modalActionType").value = actionType;
    document.getElementById("modalJustificacion").value = "";

    summary.innerHTML = `<strong>Incidencia #${id}:</strong> ${escapeHtml(titulo)}`;

    if (actionType === "RESOLVE") {
        title.innerText = "Resolver e Incidencia Finalizada";
        label.innerHTML = `<i class="fa-solid fa-clipboard-check"></i> Detalles de la Solución`;
        document.getElementById("modalJustificacion").placeholder = "Ingresa los detalles técnicos de los trabajos realizados (ej. Se reemplazó la lámpara quemada del proyector)...";
        submitBtnText.innerText = "Finalizar Incidencia";
        document.getElementById("modalSubmitBtn").className = "btn-primary btn-action-resolve";
    } else {
        title.innerText = "Rechazar Incidencia";
        label.innerHTML = `<i class="fa-solid fa-ban"></i> Motivo de Rechazo`;
        document.getElementById("modalJustificacion").placeholder = "Ingresa los motivos detallados por los cuales se rechaza este reporte (ej. El proyector está encendiendo correctamente y se verificó que la falla era un cable HDMI mal conectado)...";
        submitBtnText.innerText = "Rechazar Reporte";
        document.getElementById("modalSubmitBtn").className = "btn-primary btn-action-reject";
    }

    modal.style.display = "flex";
}

function handleModalSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById("modalIncidenciaId").value);
    const actionType = document.getElementById("modalActionType").value;
    const justificacion = document.getElementById("modalJustificacion").value.trim();

    if (!justificacion) {
        showToast("Error", "Por favor ingresa la justificación requerida.", "danger");
        return;
    }

    const nextState = actionType === "RESOLVE" ? "FINALIZADO" : "RECHAZADO";
    
    changeStatus(id, nextState, justificacion);
    document.getElementById("actionModal").style.display = "none";
}

// 12. ADMINISTRADOR DASHBOARD OPERATIONS
async function loadAdminIncidencias(categoryFilter = "TODAS") {
    const tableBody = document.getElementById("adminTableBody");
    
    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        let filtered = incidencias;
        if (categoryFilter !== "TODAS") {
            filtered = incidencias.filter(i => i.categoria === categoryFilter);
        }
        
        renderAdminTable(filtered);
        updateAdminStats(incidencias);
    } else {
        try {
            const res = await fetch(`${API_BASE}/incidencias`);
            if (res.ok) {
                const list = await res.json();
                let filtered = list;
                if (categoryFilter !== "TODAS") {
                    filtered = list.filter(i => i.categoria === categoryFilter);
                }
                renderAdminTable(filtered);
                updateAdminStats(list);
            }
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-red">Error al comunicar con la base de datos del servidor Java.</td></tr>';
        }
    }
}

function renderAdminTable(list) {
    const tableBody = document.getElementById("adminTableBody");
    tableBody.innerHTML = "";

    if (list.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay registros de incidencias para este filtro.</td></tr>';
        return;
    }

    list.forEach(i => {
        const tr = document.createElement("tr");
        
        const badgeHtml = `<span class="badge ${getStateBadgeClass(i.estado)}">${i.estado}</span>`;
        const tecnicoLabel = i.tecnico ? escapeHtml(i.tecnico.nombre) : `<span class="text-muted">No asignado</span>`;
        
        let actionBtn = "";
        // Delete button simulation for Admin
        actionBtn = `<button class="btn-text-only text-red" onclick="deleteIncidenceSim(${i.id})"><i class="fa-solid fa-trash-can"></i> Borrar</button>`;

        tr.innerHTML = `
            <td>#${i.id}</td>
            <td>
                <span class="table-title-bold">${escapeHtml(i.titulo)}</span><br>
                <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(i.aula)}</small>
            </td>
            <td>${escapeHtml(i.creador.nombre)}</td>
            <td><span class="inc-cat-tag">${i.categoria}</span></td>
            <td>${badgeHtml}</td>
            <td>${tecnicoLabel}</td>
            <td>${formatDate(i.fechaCreacion)}</td>
            <td>${actionBtn}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateAdminStats(list) {
    document.getElementById("adminStatTotal").innerText = list.length;
    document.getElementById("adminStatPendientes").innerText = list.filter(i => i.estado === "PENDIENTE").length;
    document.getElementById("adminStatAtendiendo").innerText = list.filter(i => i.estado === "ATENDIENDO").length;
    document.getElementById("adminStatFinalizados").innerText = list.filter(i => i.estado === "FINALIZADO").length;
}

// Simulate incident deletion for Admin in mock mode
window.deleteIncidenceSim = function(id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la incidencia #${id} del sistema de auditoría?`)) {
        return;
    }

    if (isDemoMode) {
        const incidencias = JSON.parse(localStorage.getItem("sinfonia_incidencias"));
        const filtered = incidencias.filter(i => i.id !== id);
        localStorage.setItem("sinfonia_incidencias", JSON.stringify(filtered));
        showToast("Registro Eliminado", `Se borró la incidencia #${id} del registro local.`, "success");
        loadAdminIncidencias(getActiveAdminFilter());
    } else {
        showToast("Restricción de Servidor", "La eliminación de registros requiere privilegios de base de datos directos en este ambiente.", "warning");
    }
};

function getActiveAdminFilter() {
    const activeBtn = document.querySelector("#adminDashboard .btn-filter.active");
    return activeBtn ? activeBtn.dataset.filter : "TODAS";
}

// 13. TOAST MESSAGES UTILITY
function showToast(title, text, type = "primary") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    
    // Type setting
    let toastTypeClass = "";
    let iconClass = "fa-circle-info";
    if (type === "warning") {
        toastTypeClass = "toast-warning";
        iconClass = "fa-triangle-exclamation";
    } else if (type === "success") {
        toastTypeClass = "toast-success";
        iconClass = "fa-circle-check";
    } else if (type === "danger") {
        toastTypeClass = "toast-danger";
        iconClass = "fa-circle-xmark";
    }

    toast.className = `toast glass-panel ${toastTypeClass}`;
    toast.innerHTML = `
        <div class="toast-icon ${type === 'primary' ? 'text-blue' : 'text-' + type}"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-body">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-text">${escapeHtml(text)}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.transform = "translateX(120%)";
        toast.style.transition = "all 0.4s ease";
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// 14. HELPER UTILS
function escapeHtml(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(string).replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Expose openActionModal & changeStatus to window scope for HTML onclick attributes
window.openActionModal = openActionModal;
window.changeStatus = changeStatus;
