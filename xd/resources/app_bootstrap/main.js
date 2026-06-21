const { app, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('[Bootstrap] Starting launcher bootstrap...');

const resourcesDir = path.join(path.dirname(process.execPath), 'resources');
const sourceAsar = path.join(resourcesDir, 'app_core.asar');
const activeAsar = path.join(resourcesDir, 'app_core_active.asar');

const isDev = !app.isPackaged;

if (isDev) {
    console.log('[Bootstrap] Running in Development Mode.');
    const bytenode = require('bytenode');
    require('./main.jsc');
} else {
    const originalFs = require('original-fs');
    // bundledAsar is the ultimate fallback — shipped inside app.asar itself
    const bundledAsar = path.join(__dirname, 'app_core.asar');

    // 1. Extraer el app_core.asar inicial si viene empaquetado en el bootstrap
    //    Esto asegura que sourceAsar siempre exista aunque el updater lo haya borrado
    if (fs.existsSync(bundledAsar)) {
        try {
            let shouldCopy = true;
            if (originalFs.existsSync(sourceAsar)) {
                try {
                    const srcStat = fs.statSync(bundledAsar);
                    const destStat = originalFs.statSync(sourceAsar);
                    if (srcStat.size === destStat.size && srcStat.mtimeMs === destStat.mtimeMs) {
                        shouldCopy = false;
                    }
                } catch (statErr) {
                    console.error('[Bootstrap] Stat error comparing asars:', statErr.message);
                }
            }
            if (shouldCopy) {
                console.log('[Bootstrap] Extracting/updating bundled app_core.asar...');
                if (originalFs.existsSync(sourceAsar)) {
                    try { originalFs.unlinkSync(sourceAsar); } catch(e) {
                        console.error('[Bootstrap] Warning: could not delete old sourceAsar:', e.message);
                    }
                }
                try {
                    originalFs.mkdirSync(path.dirname(sourceAsar), { recursive: true });
                    const content = fs.readFileSync(bundledAsar);
                    originalFs.writeFileSync(sourceAsar, content);
                    const srcStat = fs.statSync(bundledAsar);
                    try { originalFs.utimesSync(sourceAsar, srcStat.atime, srcStat.mtime); } catch(e) {}
                    console.log('[Bootstrap] Bundled app_core.asar extracted successfully.');
                } catch (writeErr) {
                    console.error('[Bootstrap] Could not write sourceAsar (permissions?):', writeErr.message);
                    // Continue — we'll fall back to bundledAsar later if needed
                }
            }
        } catch (e) {
            console.error('[Bootstrap] Failed to extract/update bundled app_core.asar:', e);
        }
    }

    // 2. Copiar síncronamente el sourceAsar al activeAsar si son diferentes
    if (originalFs.existsSync(sourceAsar)) {
        try {
            let shouldCopy = true;
            if (originalFs.existsSync(activeAsar)) {
                try {
                    const srcStat = originalFs.statSync(sourceAsar);
                    const destStat = originalFs.statSync(activeAsar);
                    if (srcStat.size === destStat.size && srcStat.mtimeMs === destStat.mtimeMs) {
                        shouldCopy = false;
                    }
                } catch (statErr) {
                    console.error('[Bootstrap] Stat error comparing active asar:', statErr.message);
                }
            }
            if (shouldCopy) {
                console.log('[Bootstrap] Updating active core asar...');
                if (originalFs.existsSync(activeAsar)) {
                    try { originalFs.unlinkSync(activeAsar); } catch(e) {
                        console.error('[Bootstrap] Warning: could not delete old activeAsar:', e.message);
                    }
                }
                try {
                    originalFs.copyFileSync(sourceAsar, activeAsar);
                    const srcStat = originalFs.statSync(sourceAsar);
                    try { originalFs.utimesSync(activeAsar, srcStat.atime, srcStat.mtime); } catch(e) {}
                    console.log('[Bootstrap] Active core asar updated.');
                } catch (copyErr) {
                    console.error('[Bootstrap] Could not copy to activeAsar (permissions?):', copyErr.message);
                    // Continue — we'll fall back to sourceAsar or bundledAsar
                }
            }
        } catch (e) {
            console.error('[Bootstrap] Error copying core asar:', e);
        }
    }

    // 3. Determinar qué asar ejecutar, con múltiples fallbacks
    let runAsar = null;
    if (originalFs.existsSync(activeAsar)) {
        runAsar = activeAsar;
    } else if (originalFs.existsSync(sourceAsar)) {
        runAsar = sourceAsar;
        console.log('[Bootstrap] Warning: activeAsar missing, falling back to sourceAsar.');
    } else if (fs.existsSync(bundledAsar)) {
        // Último recurso: ejecutar directamente del bundled asar interno
        runAsar = bundledAsar;
        console.log('[Bootstrap] Warning: neither activeAsar nor sourceAsar found, using internal bundled copy.');
    }

    if (!runAsar) {
        // Fatal: no hay ningún asar disponible. Mostrar error claro al usuario.
        dialog.showErrorBox(
            'Nebula Launcher — Error de arranque',
            'No se encontró el núcleo de la aplicación (app_core.asar).\n\n' +
            'Esto puede ocurrir si una actualización no se completó correctamente.\n\n' +
            'Solución: Reinstala Nebula Launcher desde nebula-launcher.com'
        );
        console.error('[Bootstrap] FATAL: No core asar found at any location.');
        app.quit();
    } else {
        console.log('[Bootstrap] Executing core asar from:', runAsar);
        try {
            const bytenode = require('bytenode');
            require(path.join(runAsar, 'main.jsc'));
        } catch (loadErr) {
            console.error('[Bootstrap] FATAL: Failed to load core asar:', loadErr.message);
            dialog.showErrorBox(
                'Nebula Launcher — Error de arranque',
                'No se pudo cargar el núcleo de la aplicación.\n\n' +
                'El archivo del launcher puede estar dañado.\n\n' +
                'Solución: Reinstala Nebula Launcher desde nebula-launcher.com\n\n' +
                'Error: ' + loadErr.message
            );
            app.quit();
        }
    }
}
