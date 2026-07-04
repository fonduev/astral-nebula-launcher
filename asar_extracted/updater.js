// ╔══════════════════════════════════════════════════════════════╗
// ║         NEBULA LAUNCHER — updater.js                        ║
// ║    Módulo de actualización automática del launcher          ║
// ╚══════════════════════════════════════════════════════════════╝
//
// Este archivo gestiona:
//   - Verificación de actualizaciones desde el servidor (update.json)
//   - Descarga del nuevo app.asar en segundo plano
//   - Aplicación del parche (bat script que reemplaza el asar y reinicia)
//   - Badge de estado en la interfaz (buscando / nueva versión / al día)
//
// Uso desde index.html:
//   <script src="updater.js"></script>
//   Luego llama initUpdater() al cargar la app.

(function () {
    'use strict';

    // ── Configuración ────────────────────────────────────────────────
    const IPC_CHECK  = 'check-for-updates';
    const IPC_DL     = 'download-update';
    const IPC_APPLY  = 'apply-update';
    const IPC_DL_PROGRESS = 'update-download-progress';
    const IPC_DL_OK  = 'update-download-success';
    const IPC_DL_ERR = 'update-download-error';

    // ── Estado interno ───────────────────────────────────────────────
    let state = 'idle'; // idle | checking | up-to-date | available | downloading | ready
    let updateInfo  = null;
    let dlPercent   = 0;
    let autoCheckTimer = null;

    // ── Referencias DOM (se rellenan en initUpdater) ─────────────────
    let badgeEl         = null;
    let badgeDotEl      = null;
    let badgeLabelEl    = null;
    let panelStatusEl   = null;
    let panelNoteEl     = null;
    let panelVerEl      = null;
    let panelBtnCheck   = null;
    let panelBtnDl      = null;
    let panelBtnApply   = null;
    let dlProgressEl    = null;
    let dlBarEl         = null;
    let dlTextEl        = null;

    // ── Helpers ──────────────────────────────────────────────────────
    function setState(newState) {
        state = newState;
        renderBadge();
        renderPanel();
    }

    // ── Badge flotante ───────────────────────────────────────────────
    function renderBadge() {
        if (!badgeEl) return;
        badgeEl.className = 'updater-badge updater-badge--' + state;

        switch (state) {
            case 'checking':
                badgeDotEl.className  = 'updater-dot updater-dot--spin';
                badgeLabelEl.textContent = 'Buscando actualización…';
                badgeEl.style.display = 'flex';
                break;
            case 'up-to-date':
                badgeDotEl.className  = 'updater-dot updater-dot--ok';
                badgeLabelEl.textContent = 'Versión más reciente';
                badgeEl.style.display = 'flex';
                // Ocultar badge de "al día" después de 4 segundos
                setTimeout(() => {
                    if (state === 'up-to-date') badgeEl.style.display = 'none';
                }, 4000);
                break;
            case 'available':
                badgeDotEl.className  = 'updater-dot updater-dot--pulse';
                badgeLabelEl.textContent = `✨ Nueva versión ${updateInfo?.version || ''}`;
                badgeEl.style.display = 'flex';
                break;
            case 'downloading':
                badgeDotEl.className  = 'updater-dot updater-dot--spin';
                badgeLabelEl.textContent = `Descargando… ${dlPercent}%`;
                badgeEl.style.display = 'flex';
                break;
            case 'ready':
                badgeDotEl.className  = 'updater-dot updater-dot--pulse';
                badgeLabelEl.textContent = '🔄 Reiniciar Launcher';
                badgeEl.style.display = 'flex';
                break;
            default:
                badgeEl.style.display = 'none';
        }
    }

    // ── Panel de actualizaciones ─────────────────────────────────────
    function renderPanel() {
        if (!panelStatusEl) return;

        // Ocultar todo por defecto y luego mostrar según estado
        [panelBtnCheck, panelBtnDl, panelBtnApply].forEach(b => { if (b) b.style.display = 'none'; });
        if (dlProgressEl) dlProgressEl.style.display = 'none';

        switch (state) {
            case 'idle':
                panelStatusEl.textContent = 'Haz clic en "Buscar actualizaciones" para comprobar.';
                panelStatusEl.className   = 'updater-status updater-status--idle';
                if (panelVerEl)  panelVerEl.textContent  = '';
                if (panelNoteEl) panelNoteEl.textContent = '';
                if (panelBtnCheck) panelBtnCheck.style.display = 'inline-flex';
                break;

            case 'checking':
                panelStatusEl.textContent = '⏳ Buscando actualizaciones…';
                panelStatusEl.className   = 'updater-status updater-status--checking';
                if (panelVerEl)  panelVerEl.textContent  = '';
                if (panelNoteEl) panelNoteEl.textContent = '';
                if (panelBtnCheck) { panelBtnCheck.style.display = 'inline-flex'; panelBtnCheck.disabled = true; }
                break;

            case 'up-to-date':
                panelStatusEl.textContent = '✅ ¡Ya tienes la versión más reciente!';
                panelStatusEl.className   = 'updater-status updater-status--ok';
                if (panelVerEl)  panelVerEl.textContent  = '';
                if (panelNoteEl) panelNoteEl.textContent = '';
                if (panelBtnCheck) { panelBtnCheck.style.display = 'inline-flex'; panelBtnCheck.disabled = false; }
                break;

            case 'available':
                panelStatusEl.textContent = `🚀 Nueva versión disponible: ${updateInfo?.version || ''}`;
                panelStatusEl.className   = 'updater-status updater-status--available';
                if (panelVerEl)  panelVerEl.textContent  = updateInfo?.version  || '';
                if (panelNoteEl) {
                    panelNoteEl.textContent = updateInfo?.notes || '';
                    panelNoteEl.style.display = (updateInfo?.notes) ? 'block' : 'none';
                }
                if (panelBtnCheck) { panelBtnCheck.style.display = 'inline-flex'; panelBtnCheck.disabled = false; }
                if (panelBtnDl)    panelBtnDl.style.display = 'inline-flex';
                break;

            case 'downloading':
                panelStatusEl.textContent = `⬇️ Descargando actualización… ${dlPercent}%`;
                panelStatusEl.className   = 'updater-status updater-status--downloading';
                if (panelBtnCheck) panelBtnCheck.disabled = true;
                if (dlProgressEl) dlProgressEl.style.display = 'block';
                if (dlBarEl)  dlBarEl.style.width = dlPercent + '%';
                if (dlTextEl) dlTextEl.textContent = dlPercent + '%';
                break;

            case 'ready':
                panelStatusEl.textContent = '✅ Actualización implementada. Reinicia el launcher para aplicar los cambios.';
                panelStatusEl.className   = 'updater-status updater-status--ready';
                if (panelBtnCheck) { panelBtnCheck.style.display = 'inline-flex'; panelBtnCheck.disabled = false; }
                if (panelBtnApply) panelBtnApply.style.display = 'inline-flex';
                break;
        }
    }

    // ── Lógica de IPC ────────────────────────────────────────────────
    function checkForUpdates() {
        if (state === 'checking' || state === 'downloading') return;
        setState('checking');

        // Usar el ipc del renderer (ipcRenderer)
        const ipc = window.__ipcRenderer__;
        if (!ipc) {
            console.warn('[Updater] ipcRenderer no disponible');
            setState('idle');
            return;
        }

        ipc.invoke(IPC_CHECK).then(result => {
            if (result && result.updateAvailable) {
                updateInfo = result;
                setState('available');
            } else {
                setState('up-to-date');
            }
        }).catch(err => {
            console.error('[Updater] Error al verificar:', err);
            setState('idle');
        });
    }

    function downloadUpdate() {
        if (!updateInfo || !updateInfo.url) return;
        if (state === 'downloading') return;
        setState('downloading');
        dlPercent = 0;

        const ipc = window.__ipcRenderer__;
        if (!ipc) { setState('available'); return; }

        // Registrar listeners de progreso
        ipc.removeAllListeners(IPC_DL_PROGRESS);
        ipc.removeAllListeners(IPC_DL_OK);
        ipc.removeAllListeners(IPC_DL_ERR);

        ipc.on(IPC_DL_PROGRESS, (_e, data) => {
            dlPercent = data.percent || 0;
            renderBadge();
            renderPanel();
        });

        ipc.once(IPC_DL_OK, () => {
            setState('ready');
        });

        ipc.once(IPC_DL_ERR, (_e, msg) => {
            console.error('[Updater] Error al descargar:', msg);
            setState('available');
        });

        ipc.send(IPC_DL, { url: updateInfo.url });
    }

    function applyUpdate() {
        const ipc = window.__ipcRenderer__;
        if (!ipc) return;
        ipc.send(IPC_APPLY);
    }

    // ── Auto-comprobación al inicio ──────────────────────────────────
    function scheduleAutoCheck(delayMs) {
        clearTimeout(autoCheckTimer);
        autoCheckTimer = setTimeout(() => {
            checkForUpdates();
        }, delayMs);
    }

    // ── Inicialización pública ────────────────────────────────────────
    function initUpdater() {
        // Badge flotante
        badgeEl      = document.getElementById('updater-badge');
        badgeDotEl   = document.getElementById('updater-badge-dot');
        badgeLabelEl = document.getElementById('updater-badge-label');

        // Panel
        panelStatusEl  = document.getElementById('updater-panel-status');
        panelNoteEl    = document.getElementById('updater-panel-notes');
        panelVerEl     = document.getElementById('updater-panel-ver');
        panelBtnCheck  = document.getElementById('updater-btn-check');
        panelBtnDl     = document.getElementById('updater-btn-download');
        panelBtnApply  = document.getElementById('updater-btn-apply');
        dlProgressEl   = document.getElementById('updater-dl-progress');
        dlBarEl        = document.getElementById('updater-dl-bar');
        dlTextEl       = document.getElementById('updater-dl-text');

        // Mostrar versión actual en el panel
        try {
            const pkg = require('./package.json');
            if (panelVerEl && pkg.version) {
                panelVerEl.textContent = 'v' + pkg.version;
            }
        } catch (e) { /* ignorar en env. sin node */ }

        // Registrar la referencia global al IPC (se hace desde index.html)
        // window.__ipcRenderer__ debe estar definido antes de llamar a initUpdater()

        setState('idle');

        // Auto-comprobar 3 segundos después del inicio
        scheduleAutoCheck(3000);
    }

    // ── Exponer API global ───────────────────────────────────────────
    window.Updater = {
        init:    initUpdater,
        check:   checkForUpdates,
        download: downloadUpdate,
        apply:   applyUpdate,
        getState: () => state,
    };

})();
