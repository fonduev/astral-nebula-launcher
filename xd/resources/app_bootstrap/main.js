const { app } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('[Bootstrap] Starting launcher bootstrap...');

const resourcesDir = path.join(path.dirname(process.execPath), 'resources');
const sourceAsar = path.join(resourcesDir, 'app_core.asar');
const activeAsar = path.join(resourcesDir, 'app_core.asar.active');

const isDev = !app.isPackaged;

if (isDev) {
    console.log('[Bootstrap] Running in Development Mode.');
    const bytenode = require('bytenode');
    require('./main.jsc');
} else {
    const originalFs = require('original-fs');

    // 1. Extraer el app_core.asar inicial si viene empaquetado en el bootstrap
    const bundledAsar = path.join(__dirname, 'app_core.asar');
    if (fs.existsSync(bundledAsar)) {
        try {
            let shouldCopy = true;
            if (originalFs.existsSync(sourceAsar)) {
                const srcStat = fs.statSync(bundledAsar);
                const destStat = originalFs.statSync(sourceAsar);
                if (srcStat.size === destStat.size && srcStat.mtimeMs === destStat.mtimeMs) {
                    shouldCopy = false;
                }
            }
            if (shouldCopy) {
                console.log('[Bootstrap] Extracting/updating bundled app_core.asar...');
                if (originalFs.existsSync(sourceAsar)) {
                    try { originalFs.unlinkSync(sourceAsar); } catch(e) {}
                }
                const content = fs.readFileSync(bundledAsar);
                originalFs.writeFileSync(sourceAsar, content);
                const srcStat = fs.statSync(bundledAsar);
                originalFs.utimesSync(sourceAsar, srcStat.atime, srcStat.mtime);
            }
        } catch (e) {
            console.error('[Bootstrap] Failed to extract/update bundled app_core.asar:', e);
        }
    }

    // 2. Copiar síncronamente el sourceAsar al activeAsar si son diferentes
    try {
        if (originalFs.existsSync(sourceAsar)) {
            let shouldCopy = true;
            if (originalFs.existsSync(activeAsar)) {
                const srcStat = originalFs.statSync(sourceAsar);
                const destStat = originalFs.statSync(activeAsar);
                if (srcStat.size === destStat.size && srcStat.mtimeMs === destStat.mtimeMs) {
                    shouldCopy = false;
                }
            }
            if (shouldCopy) {
                console.log('[Bootstrap] Updating active core asar...');
                if (originalFs.existsSync(activeAsar)) {
                    try { originalFs.unlinkSync(activeAsar); } catch(e) {}
                }
                originalFs.copyFileSync(sourceAsar, activeAsar);
                const srcStat = originalFs.statSync(sourceAsar);
                originalFs.utimesSync(activeAsar, srcStat.atime, srcStat.mtime);
            }
        }
    } catch (e) {
        console.error('[Bootstrap] Error copying core asar:', e);
    }

    const runAsar = originalFs.existsSync(activeAsar) ? activeAsar : sourceAsar;
    console.log('[Bootstrap] Executing core asar from:', runAsar);
    
    const bytenode = require('bytenode');
    require(path.join(runAsar, 'main.jsc'));
}
