// ╔══════════════════════════════════════════════════════════════╗
// ║         NEBULA LAUNCHER — main.js v5.0                      ║
// ║              Proceso principal de Electron                  ║
// ╚══════════════════════════════════════════════════════════════╝
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { Client, Authenticator } = require('minecraft-launcher-core');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { execSync, spawn, exec } = require('child_process');
const crypto = require('crypto');
const AdmZip = require('adm-zip');

// Data directory base (evita ENOTDIR escribiendo dentro de app.asar)
const BASE_DATA_DIR = app.isPackaged ? app.getPath('userData') : __dirname;

// Resources directory for update operations
const resourcesDir = app.isPackaged
    ? path.join(path.dirname(process.execPath), 'resources')
    : path.join(app.getAppPath(), '..');

// ── Discord RPC ───────────────────────────────────────────────────
// ┌─────────────────────────────────────────────────────────────┐
// │  PASO 1: Ve a https://discord.com/developers/applications   │
// │  PASO 2: Crea una app llamada "Nebula Launcher"             │
// │  PASO 3: Copia el Application ID y pégalo abajo            │
// │  PASO 4: En "Rich Presence > Art Assets" sube tus imágenes │
// │    - launcher_logo  (logo del launcher)                     │
// │    - mc_logo        (logo de Minecraft)                     │
// └─────────────────────────────────────────────────────────────┘
const DISCORD_CLIENT_ID = '1492726711752851466';
// Critical JVM args required by NeoForge/Forge to run on modern Java
const NEOFORGE_CRITICAL_JVM_ARGS = [
    '--add-modules=ALL-MODULE-PATH',
    '--add-opens=java.base/java.util.jar=ALL-UNNAMED',
    '--add-opens=java.base/java.lang.invoke=ALL-UNNAMED',
    '--add-exports=java.base/sun.security.util=ALL-UNNAMED',
    '--add-exports=jdk.naming.dns/com.sun.jndi.dns=java.naming'
];

let rpcClient = null;
let rpcReady = false;
let rpcStartTime = Date.now();
let rpcRetryTimeout = null;

function initDiscordRPC() {
    // Si discord-rpc no está instalado aún, falla silenciosamente
    let RPC;
    try { RPC = require('discord-rpc'); } catch { return; }
    if (DISCORD_CLIENT_ID === 'TU_CLIENT_ID_AQUI') return; // Sin configurar

    try {
        RPC.register(DISCORD_CLIENT_ID);
        rpcClient = new RPC.Client({ transport: 'ipc' });

        rpcClient.on('ready', () => {
            rpcReady = true;
            console.log('[Discord RPC] ✅ Conectado');
            setRPCLauncher();
        });

        rpcClient.on('disconnected', () => {
            rpcReady = false;
            rpcClient = null;
            // Reconectar en 30 segundos (Discord puede cerrarse y reabrirse)
            if (rpcRetryTimeout) clearTimeout(rpcRetryTimeout);
            rpcRetryTimeout = setTimeout(initDiscordRPC, 30000);
        });

        rpcClient.login({ clientId: DISCORD_CLIENT_ID }).catch(() => {
            // Discord no está abierto — reintentar en 30s
            rpcReady = false;
            rpcClient = null;
            if (rpcRetryTimeout) clearTimeout(rpcRetryTimeout);
            rpcRetryTimeout = setTimeout(initDiscordRPC, 30000);
        });
    } catch (err) {
        console.log('[Discord RPC] Error:', err.message);
    }
}

// Presencia: navegando el launcher
function setRPCLauncher() {
    if (!rpcReady || !rpcClient) return;
    try {
        rpcClient.setActivity({
            details: '🪐 En el menú principal',
            state: 'Nebula Launcher',
            startTimestamp: rpcStartTime,
            largeImageKey: 'launcher_logo',
            largeImageText: 'Nebula Launcher',
            smallImageKey: 'mc_logo',
            smallImageText: 'Minecraft',
            instance: false,
        });
    } catch { }
}

// Presencia: jugando Minecraft o Modpack (Rich Presence más bonito)
function setRPCPlaying(mcVersion, modType = null, modpackName = null) {
    if (!rpcReady || !rpcClient) return;
    
    let details = `Jugando Minecraft ${mcVersion}`;
    let state = '🎮 Vanilla';
    
    if (modpackName) {
        details = `⚔️ Jugando ${modpackName}`;
        state = `Nebula Launcher • ${mcVersion}`;
    } else if (modType) {
        state = modType === 'optifine' ? '✨ OptiFine'
            : modType === 'neoforge' ? '🌿 NeoForge'
                : modType === 'forge' ? '🔥 Forge'
                    : modType === 'fabric' ? '💎 Fabric'
                        : '🎮 Modificado';
    }
    
    try {
        rpcClient.setActivity({
            details: details,
            state: state,
            startTimestamp: Date.now(),
            largeImageKey: 'mc_logo',
            largeImageText: `Minecraft ${mcVersion}`,
            smallImageKey: 'launcher_logo',
            smallImageText: 'Nebula Launcher',
            instance: true,
        });
    } catch { }
}

let win;
let splash;
const runningInstances = new Map(); // id → { launcher, version }
let instanceCounter = 0;
let currentOperation = null;


// ── Window ───────────────────────────────────────────────────────
function createWindow() {
    // 1. Crear ventana Splash
    splash = new BrowserWindow({
        width: 320, height: 420,
        frame: false, transparent: true,
        alwaysOnTop: true, resizable: false,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: false, contextIsolation: true }
    });
    splash.loadFile('splash.html');
    splash.center();

    // 2. Crear ventana principal oculta
    win = new BrowserWindow({
        width: 1360, height: 800,
        minWidth: 1080, minHeight: 680,
        frame: false, transparent: true,
        resizable: true, hasShadow: true,
        opacity: 0, // En lugar de show: false para evitar el bug de renderizado en Windows
        backgroundColor: '#00000000',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    win.loadFile('index.html');
    
    // AUTOMATION TEST HARNESS
    win.webContents.on('did-finish-load', () => {
        const fs = require('fs');
        const path = require('path');
        const testFlag = path.join(app.getAppPath(), '..', 'run_automation.txt');
        if (fs.existsSync(testFlag)) {
            const logPath = path.join(app.getAppPath(), '..', 'automation_log.txt');
            fs.writeFileSync(logPath, 'Automation started\n', 'utf8');
            
            const log = (msg) => {
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
            };

            const { ipcMain } = require('electron');
            ipcMain.removeAllListeners('automation-log');
            ipcMain.on('automation-log', (event, msg) => {
                log('[Renderer] ' + msg);
            });

            win.webContents.executeJavaScript(`
                window.automationLog = (msg) => {
                    try {
                        const { ipcRenderer } = require('electron');
                        ipcRenderer.send('automation-log', msg);
                    } catch(e) {}
                };

                window.automationLog("Verification script active");

                const { ipcRenderer } = require('electron');
                ipcRenderer.invoke('check-for-updates').then(res => {
                    window.automationLog("DEBUG check-for-updates result: " + JSON.stringify(res));
                }).catch(err => {
                    window.automationLog("DEBUG check-for-updates error: " + err.message);
                });

                // Wrap toast alerts
                const wrapToast = () => {
                    if (typeof window.toast === 'function') {
                        const origToast = window.toast;
                        window.toast = (msg, type) => {
                            window.automationLog("TOAST ALERT: [" + type + "] " + msg);
                            return origToast(msg, type);
                        };
                        window.automationLog("Toast wrapped successfully");
                        return true;
                    }
                    return false;
                };

                if (!wrapToast()) {
                    let wrapCount = 0;
                    const wrapInterval = setInterval(() => {
                        wrapCount++;
                        if (wrapToast() || wrapCount > 50) {
                            clearInterval(wrapInterval);
                        }
                    }, 100);
                }

                let checkCount = 0;
                const checkInterval = setInterval(() => {
                    checkCount++;
                    const modal = document.getElementById('update-modal');
                    const installBtn = document.getElementById('update-btn-install');

                    if (modal && modal.style.display !== 'none' && installBtn) {
                        clearInterval(checkInterval);
                        window.automationLog("Modal is visible. Clicking install now.");
                        installBtn.click();

                        let progressCount = 0;
                        const progressInterval = setInterval(() => {
                            progressCount++;
                            const progressVal = document.getElementById('update-progress-val');
                            const progressText = progressVal ? progressVal.textContent : '0%';
                            const btnText = installBtn.textContent;

                            window.automationLog("Update Progress: " + progressText + ", Button: " + btnText);

                            if (btnText === 'Reiniciar Launcher' || window.updateApplied) {
                                clearInterval(progressInterval);
                                window.automationLog("SUCCESS: Update completed and applied in background!");
                                
                                setTimeout(() => {
                                    window.automationLog("Clicking Reiniciar Launcher now...");
                                    installBtn.click();
                                }, 3000);
                            }

                            if (progressCount > 60) {
                                clearInterval(progressInterval);
                                window.automationLog("ERROR: Progress timeout");
                            }
                        }, 1000);
                    }

                    if (checkCount > 30) {
                        clearInterval(checkInterval);
                        window.automationLog("ERROR: Modal check timeout");
                    }
                }, 1000);
            `);
        }
    });

    // win.webContents.openDevTools();
    win.center();

    // 3. Cuando la principal esté cargada, esperar 2.5s y cambiar ventanas
    win.once('ready-to-show', () => {
        console.log('[DEBUG] ready-to-show disparado en ventana principal!');
        setTimeout(() => {
            console.log('[DEBUG] 2.5s pasaron. Cerrando splash y mostrando win.');
            if (splash && !splash.isDestroyed()) {
                splash.close();
            }
            if (win && !win.isDestroyed()) {
                win.setOpacity(1);
                win.focus();
                console.log('[DEBUG] win.setOpacity(1) ejecutado');
            }
        }, 2500); // 2.5 segundos de carga
    });
}

app.whenReady().then(() => {
    // Intentar borrar app.asar.old en el arranque si existe y no está bloqueado
    try {
        const fs = require('fs');
        const path = require('path');
        const oldAsar = path.join(path.dirname(app.getAppPath()), 'app.asar.old');
        if (fs.existsSync(oldAsar)) {
            fs.unlinkSync(oldAsar);
            console.log('[Updater] Eliminado app.asar.old anterior.');
        }
    } catch(e) {
        console.error('[Updater] No se pudo eliminar app.asar.old:', e);
    }
    
        createWindow();
    initDiscordRPC();
});
app.on('window-all-closed', () => {
    if (rpcClient) { try { rpcClient.destroy(); } catch { } }
    if (rpcRetryTimeout) clearTimeout(rpcRetryTimeout);
    if (process.platform !== 'darwin') app.quit();
});

// ── IPC helpers ───────────────────────────────────────────────────
const sendLog = (msg, type = 'info') => win?.webContents.send('log', { msg: String(msg), type });
const sendProgress = (percent, label = '') => win?.webContents.send('progress', { percent, label });

// ── Java utils ────────────────────────────────────────────────────
function findJavaExe(dir) {
    if (!fs.existsSync(dir)) return null;
    try {
        for (const f of fs.readdirSync(dir)) {
            const full = path.join(dir, f);
            try {
                if (fs.statSync(full).isDirectory()) {
                    const found = findJavaExe(full);
                    if (found) return found;
                } else if (f.toLowerCase() === 'java.exe' || f.toLowerCase() === 'java') return full;
            } catch { }
        }
    } catch { }
    return null;
}

function requiredJavaVersion(mcVer) {
    // Snapshots con formato "26w15a", "25w01a", etc.
    const snapshotMatch = mcVer.match(/^(\d{2})w\d+/);
    if (snapshotMatch) {
        const year = parseInt(snapshotMatch[1]);
        if (year >= 25) return 25;   // Snapshots 2025+ necesitan Java 25
        if (year >= 21) return 21;   // Snapshots 2021-2024 necesitan Java 21
        if (year >= 17) return 17;
        return 8;
    }

    // Versiones con formato numérico: "1.21.4", "26.1", etc.
    const parts = mcVer.replace(/[^0-9.]/g, '').split('.').map(Number);
    const major = parts[0] ?? 0;
    const minor = parts[1] ?? 0;
    const patch = parts[2] ?? 0;

    // Versiones futuras: 26.x, 27.x, etc. (nueva nomenclatura Mojang)
    if (major !== 1 && major >= 26) return 25;
    if (major !== 1 && major >= 2) return 21;

    // Versiones clásicas 1.x.x
    if (minor >= 21 || (minor === 20 && patch >= 5)) return 21;
    if (minor >= 17) return 17;
    return 8;
}

async function ensureJava(mcVersion, customJava) {
    if (customJava && fs.existsSync(customJava)) return customJava;
    const jv = requiredJavaVersion(mcVersion);
    const javaDir = path.join(BASE_DATA_DIR, 'runtimes', `java${jv}`);
    let exe = findJavaExe(javaDir);
    if (exe) return exe;
    sendLog(`☕ Descargando Java ${jv}…`);
    sendProgress(0, `Descargando Java ${jv}…`);
    fs.mkdirSync(javaDir, { recursive: true });
    const zipPath = path.join(BASE_DATA_DIR, 'runtimes', `java${jv}.zip`);

    let url;

    if (jv >= 25) {
        // Java 25+: MC 26.x requiere JavaFX.
        // Liberica JDK Full = OpenJDK + JavaFX bundled (igual que el JDK oficial de Mojang)
        sendLog(`☕ Java ${jv} — buscando Liberica JDK Full (incluye JavaFX)...`);
        try {
            const apiResp = await httpsGet(
                `https://api.bell-sw.com/v1/liberica/releases?arch=amd64&os=windows` +
                `&package-type=zip&bundle-type=jdk-full&version-feature=${jv}&version-modifier=latest`
            );
            const releases = JSON.parse(apiResp);
            if (releases && releases.length > 0 && releases[0].downloadUrl) {
                url = releases[0].downloadUrl;
                sendLog(`☕ Liberica JDK ${jv} Full — ${releases[0].version}`);
            }
        } catch (e) {
            sendLog(`⚠️ Liberica API: ${e.message}`);
        }
        // Fallback: Adoptium sin JavaFX (puede no funcionar en MC 26.x)
        if (!url) {
            url = `https://api.adoptium.net/v3/binary/latest/${jv}/ga/windows/x64/jdk/hotspot/normal/eclipse`;
            sendLog(`☕ Java ${jv} — Adoptium (sin JavaFX, puede fallar en MC 26.x)`);
        }
    } else {
        // Java 8, 17, 21: Adoptium es suficiente (no necesitan JavaFX)
        url = `https://api.adoptium.net/v3/binary/latest/${jv}/ga/windows/x64/jdk/hotspot/normal/eclipse`;
    }

    await downloadFile(url, zipPath, p => sendProgress(Math.floor(p * 0.8), `Java ${jv}: ${p}%`));
    sendLog('Extrayendo Java…');
    execSync(`tar -xf "${zipPath}" -C "${javaDir}"`);
    try { fs.unlinkSync(zipPath); } catch { }
    exe = findJavaExe(javaDir);
    if (!exe) throw new Error(`No se pudo instalar Java ${jv}`);
    sendProgress(100, `Java ${jv} listo ✓`);
    return exe;
}

// ── Limpiar librerías corruptas antes de lanzar ────────────────────
// Una descarga interrumpida deja JARs con ZIP truncado → crash en Fabric/Forge
function cleanCorruptedLibs(mcPath) {
    const libsDir = path.join(mcPath, 'libraries');
    if (!fs.existsSync(libsDir)) return;
    let cleaned = 0;
    function scan(dir) {
        try {
            for (const f of fs.readdirSync(dir)) {
                const fp = path.join(dir, f);
                try {
                    const st = fs.statSync(fp);
                    if (st.isDirectory()) { scan(fp); continue; }
                    // JAR vacío o casi vacío = descarga incompleta
                    if (f.endsWith('.jar') && st.size < 512) {
                        fs.unlinkSync(fp);
                        sendLog(`🧹 JAR corrupto eliminado: ${f}`);
                        cleaned++;
                    }
                    // JAR que no termina en bytes de firma ZIP (PK)
                    // Solo verificar JARs <= 5MB para no ser lento
                    else if (f.endsWith('.jar') && st.size <= 5 * 1024 * 1024) {
                        const fd = fs.openSync(fp, 'r');
                        const tail = Buffer.alloc(22);
                        fs.readSync(fd, tail, 0, 22, Math.max(0, st.size - 22));
                        fs.closeSync(fd);
                        // Signature de End of Central Directory = 0x06054b50
                        if (tail.readUInt32LE(0) !== 0x06054b50 &&
                            !tail.includes(Buffer.from([0x50, 0x4b, 0x05, 0x06]))) {
                            fs.unlinkSync(fp);
                            sendLog(`🧹 JAR truncado eliminado: ${f}`);
                            cleaned++;
                        }
                    }
                } catch { }
            }
        } catch { }
    }
    scan(libsDir);
    if (cleaned > 0) sendLog(`🧹 ${cleaned} librería(s) corruptas eliminadas — se re-descargarán`);
}

// ── Network utils ─────────────────────────────────────────────────
function downloadFile(url, dest, onProgress) {
    return new Promise((resolve, reject) => {
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        const attempt = (reqUrl, redirectCount = 0) => {
            if (redirectCount > 10) return reject(new Error('Demasiados redirects'));
            const lib = reqUrl.startsWith('https') ? https : http;
            const req = lib.get(reqUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 NebulaLauncher/1.0',
                    'Accept': '*/*'
                }
            }, (res) => {
                // Seguir redirects (301, 302, 303, 307, 308)
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume(); // Consumir y descartar el cuerpo
                    let loc = res.headers.location;
                    if (!loc.startsWith('http')) {
                        const u = new URL(reqUrl);
                        loc = `${u.protocol}//${u.host}${loc}`;
                    }
                    return attempt(loc, redirectCount + 1);
                }
                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} descargando ${path.basename(dest)}`));
                }

                const file = fs.createWriteStream(dest);
                const total = parseInt(res.headers['content-length'] ?? '0');
                let received = 0;

                res.on('data', chunk => {
                    received += chunk.length;
                    if (onProgress) {
                        if (total > 0) {
                            onProgress(Math.floor((received / total) * 100));
                        } else {
                            onProgress(-1, (received / 1048576).toFixed(1));
                        }
                    }
                });
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
                file.on('error', err => {
                    file.close();
                    try { fs.unlinkSync(dest); } catch { }
                    reject(err);
                });
            });

            req.on('error', err => {
                try { fs.unlinkSync(dest); } catch { }
                reject(new Error(`Error de red: ${err.message}`));
            });

            // Timeout de 60 segundos por intento
            req.setTimeout(60000, () => {
                req.destroy();
                reject(new Error('Timeout descargando archivo (60s)'));
            });

            if (currentOperation) currentOperation.request = req;
        };

        attempt(url);
    });
}

function httpsGet(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const attempt = (reqUrl, redirectCount = 0) => {
            if (redirectCount > 10) return reject(new Error('Demasiados redirects'));
            const lib = reqUrl.startsWith('https') ? https : http;
            const req = lib.get(reqUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 NebulaLauncher/1.0' }
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return attempt(res.headers.location, redirectCount + 1);
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} desde ${reqUrl}`));
                }
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve(data));
                res.on('error', reject);
            });
            req.on('error', reject);
            req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error(`Timeout (${timeoutMs / 1000}s)`)); });
        };
        attempt(url);
    });
}

function httpsPost(url, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const bodyStr = JSON.stringify(body);
        const req = https.request({
            hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) }
        }, (res) => { let data = ''; res.on('data', c => data += c); res.on('end', () => resolve({ status: res.statusCode, data })); });
        req.on('error', reject); req.write(bodyStr); req.end();
    });
}

function ensureLauncherProfiles(mcPath) {
    fs.mkdirSync(mcPath, { recursive: true });
    const pFile = path.join(mcPath, 'launcher_profiles.json');
    if (!fs.existsSync(pFile)) {
        fs.writeFileSync(pFile, JSON.stringify({
            profiles: { "(Default)": { name: "(Default)", type: "latest-release", created: new Date().toISOString(), lastUsed: new Date().toISOString(), icon: "Grass" } },
            selectedProfile: "(Default)",
            clientToken: crypto.randomUUID(),
            launcherVersion: { name: "2.1.1349", format: 21 }
        }, null, 2));
    }
}

// ── Enriquecer version JSON de OptiFine con URLs faltantes ────────────────
// El instalador oficial deja algunas librerías sin URL (ej: net.minecraft:launchwrapper:1.12).
// MCLC necesita la URL para descargarlas si no existen localmente.
function enrichOptiFineVersionJson(jsonPath, mcPath, sendLog) {
    try {
        if (!fs.existsSync(jsonPath)) return;
        const vJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        let modified = false;

        for (const lib of (vJson.libraries || [])) {
            const hasUrl = lib.downloads?.artifact?.url;
            if (hasUrl) continue;  // Ya tiene URL, no tocar

            const parts = (lib.name || '').split(':');
            if (parts.length < 3) continue;
            const [group, artifact, version] = parts;

            const groupPath = group.replace(/\./g, '/');
            const jarName = `${artifact}-${version}.jar`;
            const libRelPath = lib.downloads?.artifact?.path ||
                `${groupPath}/${artifact}/${version}/${jarName}`;

            if (group === 'optifine') {
                // Librerías locales de optifine → poner ruta sin URL (MCLC las lee por path)
                if (!lib.downloads) {
                    lib.downloads = { artifact: { path: libRelPath, url: '', sha1: '', size: 0 } };
                    modified = true;
                }
                continue;
            }

            // Librería de Mojang Maven → añadir URL real para que MCLC la descargue
            const localPath = path.join(mcPath, 'libraries', libRelPath);
            const downloadUrl = fs.existsSync(localPath)
                ? ''   // Ya existe localmente
                : `https://libraries.minecraft.net/${libRelPath}`;

            if (!lib.downloads) lib.downloads = {};
            lib.downloads.artifact = { path: libRelPath, url: downloadUrl, sha1: '', size: 0 };
            modified = true;
            if (!fs.existsSync(localPath)) {
                sendLog?.(`🔗 URL añadida para librería: ${lib.name}`);
            }
        }

        if (modified) {
            fs.writeFileSync(jsonPath, JSON.stringify(vJson, null, 2));
            sendLog?.(`📝 version JSON enriquecido con ${vJson.libraries.length} librerías`);
        }
    } catch (e) {
        sendLog?.(`⚠️ enrichOptiFineVersionJson: ${e.message}`);
    }
}

// ── Settings ──────────────────────────────────────────────────────
const SETTINGS_PATH = path.join(BASE_DATA_DIR, 'settings.json');
function getRecommendedRamGb() {
    const os = require('os');
    try {
        const totalBytes = os.totalmem();
        const totalGb = Math.round(totalBytes / (1024 * 1024 * 1024));
        if (totalGb <= 4) return 2;
        if (totalGb <= 8) return 4;
        if (totalGb <= 12) return 6;
        if (totalGb <= 16) return 8;
        if (totalGb <= 24) return 10;
        return 12;
    } catch {
        return 4;
    }
}

function loadSettings() {
    const defaultSettings = { 
        ram: getRecommendedRamGb(), 
        javaPath: '', 
        gameDir: '', 
        theme: 'nebula', 
        lastLoginType: 'offline',
        updateUrl: 'https://raw.githubusercontent.com/fonduev/astral-nebula-launcher/main/update.json',
        adsUrl: 'https://raw.githubusercontent.com/fonduev/astral-nebula-launcher/main/ads.json',
        personalizedAds: false,
        fussionbornDownloadUrl: 'https://pub-d38529ebbdbe4598b4d3d552ffc4246f.r2.dev/FUSSIONBORN.zip',
        socialFirebase: {
            apiKey: "AIzaSyCfka9dpsVQvfsJ883segPzATNDUEuIVwc",
            projectId: "astral-nebula-social",
            authDomain: "astral-nebula-social.firebaseapp.com",
            appId: "1:289159955650:web:7906ba01ca236ae92ca75b"
        }
    };
    try {
        let data = {};
        let changed = false;
        if (fs.existsSync(SETTINGS_PATH)) {
            data = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
        } else {
            data = defaultSettings;
            changed = true;
        }
        
        // Asegurar que existan todos los campos predeterminados
        for (const k in defaultSettings) {
            if (typeof data[k] === 'undefined') {
                data[k] = defaultSettings[k];
                changed = true;
            }
        }
        
        if (changed) {
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
        }

        // Add runtime system info (do not save to settings.json, just return to frontend)
        const os = require('os');
        const totalBytes = os.totalmem();
        data.systemTotalRamGb = Math.round(totalBytes / (1024 * 1024 * 1024));
        data.systemRecommendedRamGb = getRecommendedRamGb();

        return data;
    } catch {
        return defaultSettings;
    }
}
ipcMain.handle('get-settings', () => loadSettings());
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('save-settings', (e, s) => {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(s, null, 2));
    e.reply('settings-saved');
});

// Monkeypatch child_process.spawn globally to prepend wrapper commands
const child_process = require('child_process');
const originalSpawn = child_process.spawn;
child_process.spawn = function(command, args, options) {
    const isMinecraft = args && args.some(arg => typeof arg === 'string' && (arg.includes('net.minecraft.') || arg.includes('Launch') || arg.includes('neoforged') || arg.includes('minecraft')));
    if (isMinecraft) {
        try {
            const s = loadSettings();
            if (s.prependCommand && s.prependCommand.trim()) {
                const prependParts = s.prependCommand.trim().split(/\s+/);
                const wrapperCommand = prependParts[0];
                const wrapperArgs = prependParts.slice(1);
                console.log(`[Wrapper] Prepending command: ${s.prependCommand}`);
                console.log(`[Wrapper] Original executable: ${command}`);
                const newCommand = wrapperCommand;
                const newArgs = [...wrapperArgs, command, ...args];
                return originalSpawn(newCommand, newArgs, options);
            }
        } catch (err) {
            console.error('[Wrapper] Error loading settings for wrapper prepend:', err.message);
        }
    }
    return originalSpawn(command, args, options);
};

// ── Instance directory helper ──────────────────────────────────────
// Cada loader (Forge / Fabric) tiene su propia carpeta de instancia.
// Esto evita mezclar mods, configs y mundos entre loaders distintos.
function getInstanceDir(mcPath, versionId) {
    const lower = versionId.toLowerCase();
    if (lower.includes('neoforge')) {
        const match = versionId.match(/^(\d+\.\d+(?:\.\d+)?)/);
        const mcVer = match ? match[1] : versionId;
        return path.join(mcPath, 'instances', `neoforge-${mcVer}`);
    }
    if (lower.includes('forge')) {
        const match = versionId.match(/^(\d+\.\d+(?:\.\d+)?)/);
        const mcVer = match ? match[1] : versionId;
        return path.join(mcPath, 'instances', `forge-${mcVer}`);
    }
    if (lower.includes('fabric')) {
        const match = versionId.match(/fabric-loader-[\d.]+-([\d.]+)/);
        const mcVer = match ? match[1] : versionId;
        return path.join(mcPath, 'instances', `fabric-${mcVer}`);
    }
    // Vanilla u otro: sin instancia separada
    return mcPath;
}

// ── Versioning ────────────────────────────────────────────────────
ipcMain.handle('get-all-versions', async () => {
    try {
        const data = await httpsGet('https://launchermeta.mojang.com/mc/game/version_manifest.json');
        const manifest = JSON.parse(data);
        return manifest.versions;
    } catch (err) {
        sendLog(`❌ Error cargando versiones: ${err.message}`, 'error');
        return [];
    }
});

ipcMain.handle('get-installed-versions', () => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    if (!fs.existsSync(versionsDir)) return [];

    const installed = [];
    try {
        const dirs = fs.readdirSync(versionsDir);
        for (const dir of dirs) {
            const jsonPath = path.join(versionsDir, dir, `${dir}.json`);
            if (fs.existsSync(jsonPath)) {
                try {
                    const versionData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    let baseVersion = versionData.inheritsFrom || dir;
                    let type = 'release';

                    if (dir.toLowerCase().includes('optifine')) {
                        type = 'optifine';
                        if (!versionData.inheritsFrom) {
                            const match = dir.match(/^(\d+\.\d+(?:\.\d+)?)/);
                            if (match) baseVersion = match[1];
                        }
                    }
                    else if (dir.toLowerCase().includes('neoforge')) {
                        type = 'neoforge';
                        if (!versionData.inheritsFrom) {
                            const match = dir.match(/^(\d+\.\d+(?:\.\d+)?)/);
                            if (match) baseVersion = match[1];
                        }
                    }
                    else if (dir.toLowerCase().includes('forge')) {
                        type = 'forge';
                        if (!versionData.inheritsFrom) {
                            const match = dir.match(/^(\d+\.\d+(?:\.\d+)?)/);
                            if (match) baseVersion = match[1];
                        }
                    }
                    else if (dir.toLowerCase().includes('fabric')) {
                        type = 'fabric';
                        if (!versionData.inheritsFrom) {
                            const match = dir.match(/fabric-loader-[\d\.]+-(\d+\.\d+(?:\.\d+)?)/);
                            if (match) baseVersion = match[1];
                        }
                    }

                    installed.push({
                        id: dir,
                        type: type,
                        baseVersion: baseVersion,
                        releaseTime: versionData.releaseTime || new Date().toISOString()
                    });
                } catch (e) {
                    sendLog(`⚠️ Error leyendo versión ${dir}: ${e.message}`);
                }
            }
        }
    } catch (err) {
        sendLog(`❌ Error listando versiones instaladas: ${err.message}`, 'error');
    }

    return installed.sort((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime));
});

// ── HELPER: Descarga la versión base de MC si no existe (necesario para OptiFine/Forge) ──
async function ensureMinecraftBase(mcVersion, mcPath) {
    const versionsDir = path.join(mcPath, 'versions');
    const versionDir = path.join(versionsDir, mcVersion);
    const versionJsonPath = path.join(versionDir, `${mcVersion}.json`);
    const versionJarPath = path.join(versionDir, `${mcVersion}.jar`);

    const jsonOk = fs.existsSync(versionJsonPath);
    const jarOk = fs.existsSync(versionJarPath);

    if (jsonOk && jarOk) {
        sendLog(`✅ MC ${mcVersion} ya está en caché`);
        return;
    }

    sendLog(`⬇️ MC ${mcVersion} no encontrado localmente. Descargando archivos base...`);
    sendProgress(20, `Descargando MC ${mcVersion} base...`);
    fs.mkdirSync(versionDir, { recursive: true });

    // 1. Obtener el manifest de Mojang para localizar la URL del JSON de esta versión
    const manifest = JSON.parse(await httpsGet('https://launchermeta.mojang.com/mc/game/version_manifest.json'));
    const versionMeta = manifest.versions.find(v => v.id === mcVersion);
    if (!versionMeta) throw new Error(`No se encontró "${mcVersion}" en el manifest de Mojang`);

    // 2. Descargar JSON de la versión si no existe
    if (!jsonOk) {
        sendLog(`  📄 Descargando ${mcVersion}.json...`);
        const versionJson = await httpsGet(versionMeta.url);
        fs.writeFileSync(versionJsonPath, versionJson);
    }

    // 3. Descargar cliente JAR si no existe
    if (!jarOk) {
        const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
        const clientUrl = versionData.downloads?.client?.url;
        const expectedSize = versionData.downloads?.client?.size || 0;
        if (!clientUrl) throw new Error(`No hay URL de cliente para MC ${mcVersion}`);
        sendLog(`  📥 Descargando ${mcVersion}.jar (${(expectedSize / 1048576).toFixed(1)} MB)...`);
        await downloadFile(clientUrl, versionJarPath, (p, mb) => {
            if (p === -1) sendProgress(25, `Descargando MC ${mcVersion}: ${mb} MB`);
            else sendProgress(20 + Math.floor(p * 0.25), `Descargando MC ${mcVersion}: ${p}%`);
        });
        // Verificar integridad: debe ser al menos 1MB
        if (!fs.existsSync(versionJarPath) || fs.statSync(versionJarPath).size < 1000000) {
            try { fs.unlinkSync(versionJarPath); } catch { }
            throw new Error(`Descarga de MC ${mcVersion}.jar fallida o incompleta. Verifica tu conexión a internet.`);
        }
        sendLog(`  ✅ ${mcVersion}.jar descargado (${(fs.statSync(versionJarPath).size / 1048576).toFixed(1)} MB)`);
    }

    sendLog(`✅ MC ${mcVersion} listo (JSON + JAR)`);
}

// ── OPTIFINE (FIXED - Using BMCLAPI mirror like TLauncher) ──────────
// Función interna (NO IPC handler) para verificar y obtener info de OptiFine
async function getOptiFineInfo(mcVersion) {
    try {
        sendLog(`🔍 Consultando versiones OptiFine para ${mcVersion}...`);
        // BMCLAPI es un mirror público usado por launchers alternativos (sin restricciones)
        const url = `https://bmclapi2.bangbang93.com/optifine/${mcVersion}`;
        const data = await httpsGet(url);
        const versions = JSON.parse(data);
        if (versions && versions.length > 0) {
            sendLog(`✅ OptiFine disponible: ${versions.length} versión(es) para MC ${mcVersion}`);
            return { available: true, versions };
        } else {
            sendLog(`❌ OptiFine NO disponible para ${mcVersion}`);
            return { available: false, error: `No hay OptiFine para Minecraft ${mcVersion}` };
        }
    } catch (err) {
        sendLog(`⚠️ Error consultando OptiFine: ${err.message}`);
        return { available: false, error: err.message };
    }
}

ipcMain.handle('check-optifine-available', async (event, mcVersion) => {
    return await getOptiFineInfo(mcVersion);
});

// IPC handler para obtener lista de versiones de OptiFine disponibles
ipcMain.handle('get-optifine-versions', async (event, mcVersion) => {
    const info = await getOptiFineInfo(mcVersion);
    return info.versions || [];
});

ipcMain.handle('auto-install-optifine', async (event, mcVersion) => {
    currentOperation = { type: 'optifine', cancelled: false };

    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const versionsDir = path.join(mcPath, 'versions');
        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });

        // ══ PASO 1: Java ══════════════════════════════════════════════
        sendLog(`☕ Preparando Java para MC ${mcVersion}...`);
        sendProgress(5, 'Preparando Java...');
        const javaExe = await ensureJava(mcVersion, s.javaPath);
        sendLog(`✅ Java listo: ${javaExe}`);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // ══ PASO 2: Minecraft base ════════════════════════════════════
        sendLog(`📦 Verificando Minecraft ${mcVersion} base...`);
        sendProgress(15, `Verificando MC ${mcVersion}...`);
        await ensureMinecraftBase(mcVersion, mcPath);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // ══ PASO 3: Obtener info de OptiFine en BMCLAPI ═══════════════
        sendLog(`🔍 Verificando OptiFine para ${mcVersion}...`);
        sendProgress(40, 'Consultando OptiFine...');
        const checkResult = await getOptiFineInfo(mcVersion);
        if (!checkResult.available) {
            throw new Error(checkResult.error || `OptiFine no disponible para Minecraft ${mcVersion}`);
        }

        const versionList = checkResult.versions;
        // Preferir HD_U (estable); si no, el primero disponible
        const optifineEntry = versionList.find(v => v.type === 'HD_U') || versionList[0];
        if (!optifineEntry) throw new Error(`No se encontró versión de OptiFine para ${mcVersion}`);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // ID determinístico de versión: "1.21.1_OptiFine_HD_U_J1"
        const ofVersionId = `${mcVersion}_OptiFine_${optifineEntry.type}_${optifineEntry.patch}`;
        const ofDir = path.join(versionsDir, ofVersionId);

        // ── Si ya está instalado, devolver directamente ─────────────
        if (fs.existsSync(path.join(ofDir, `${ofVersionId}.json`))) {
            sendLog(`✅ OptiFine ${ofVersionId} ya estaba instalado`);
            sendProgress(100, 'OptiFine listo ✓');
            currentOperation = null;
            return { success: true, name: optifineEntry.filename, mode: 'version', versionId: ofVersionId };
        }

        // ══ PASO 4: Descargar OptiFine JAR ════════════════════════════
        const optifineFileName = optifineEntry.filename;
        const downloadUrl = `https://bmclapi2.bangbang93.com/optifine/${mcVersion}/${optifineEntry.type}/${optifineEntry.patch}`;
        const jarPath = path.join(tempDir, optifineFileName);

        sendLog(`📥 Descargando ${optifineFileName}...`);
        sendProgress(45, `Descargando OptiFine ${optifineEntry.patch}...`);

        await downloadFile(downloadUrl, jarPath, (p, mb) => {
            if (p === -1) {
                const fakePct = Math.min(70, 45 + (parseFloat(mb) / 4) * 25);
                sendProgress(Math.floor(fakePct), `Descargando OptiFine... ${mb} MB`);
            } else {
                sendProgress(45 + Math.floor(p * 0.25), `Descargando OptiFine: ${p}%`);
            }
        });
        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        if (!fs.existsSync(jarPath) || fs.statSync(jarPath).size < 100000) {
            try { fs.unlinkSync(jarPath); } catch { }
            throw new Error('El archivo de OptiFine descargado está corrupto o incompleto.');
        }
        sendLog(`✅ Descargado: ${optifineFileName} (${(fs.statSync(jarPath).size / 1048576).toFixed(1)} MB)`);

        // ══ PASO 5: Ejecutar instalador oficial de OptiFine ════════════════════════
        // El instalador de OptiFine siempre instala en %APPDATA%\.minecraft por defecto.
        // Si nuestro directorio es distinto, copiamos el JAR base temporalmente al AppData,
        // ejecutamos el instalador allí, y copiamos el resultado de vuelta.
        sendProgress(75, 'Instalando OptiFine...');
        sendLog('⚙️ Ejecutando instalador oficial de OptiFine...');

        const defaultMcDir = path.join(process.env.APPDATA || '', '.minecraft');
        const defaultVersions = path.join(defaultMcDir, 'versions');
        const usingCustomDir = path.resolve(mcPath) !== path.resolve(defaultMcDir);

        // ── Si usamos directorio personalizado, copiar MC JAR al AppData ──────
        // El instalador necesita encontrar el JAR base de Minecraft para parchearlo.
        const defaultVerDir = path.join(defaultVersions, mcVersion);
        const defaultJarPath = path.join(defaultVerDir, `${mcVersion}.jar`);
        const defaultJsonPath = path.join(defaultVerDir, `${mcVersion}.json`);
        const sourceJarPath = path.join(versionsDir, mcVersion, `${mcVersion}.jar`);
        const sourceJsonPath = path.join(versionsDir, mcVersion, `${mcVersion}.json`);

        let copiedTempJar = false;
        if (usingCustomDir && !fs.existsSync(defaultJarPath) && fs.existsSync(sourceJarPath)) {
            sendLog(`📋 Copiando MC ${mcVersion} al directorio estándar para el instalador...`);
            fs.mkdirSync(defaultVerDir, { recursive: true });
            fs.copyFileSync(sourceJarPath, defaultJarPath);
            if (fs.existsSync(sourceJsonPath)) fs.copyFileSync(sourceJsonPath, defaultJsonPath);
            copiedTempJar = true;
        }

        // Snapshot de versiones en AppData ANTES de instalar
        const appDataVersionsBefore = new Set(
            fs.existsSync(defaultVersions) ? fs.readdirSync(defaultVersions) : []
        );
        // Snapshot en nuestro dir también
        const ourVersionsBefore = new Set(
            fs.existsSync(versionsDir) ? fs.readdirSync(versionsDir) : []
        );

        // ── Ejecutar instalador (sin -Dminecraft.dir — let it use AppData por defecto) ──
        await new Promise((resolve, reject) => {
            const proc = spawn(javaExe, [
                '-Djava.awt.headless=true',
                '-cp', jarPath,
                'optifine.Installer',
                'install'
                // SIN mcPath — dejamos que use %APPDATA%\.minecraft por defecto
            ], { stdio: ['ignore', 'pipe', 'pipe'] });

            if (currentOperation) currentOperation.proc = proc;

            proc.stdout?.on('data', d => {
                const line = d.toString().trim();
                if (line) sendLog(`[OptiFine] ${line}`);
            });
            proc.stderr?.on('data', d => {
                const line = d.toString().trim();
                if (line && !line.startsWith('Picked up') && !line.startsWith('WARNING:')) {
                    sendLog(`[OptiFine] ${line}`);
                }
            });

            proc.on('close', code => {
                if (currentOperation) currentOperation.proc = null;
                if (currentOperation?.cancelled) return reject(new Error('Operación cancelada'));
                resolve(code);
            });
            proc.on('error', err => reject(new Error(`No se pudo ejecutar el instalador: ${err.message}`)));
        });

        // Limpiar JAR temporal de MC en AppData
        if (copiedTempJar) {
            try { fs.unlinkSync(defaultJarPath); } catch { }
            try { fs.unlinkSync(defaultJsonPath); } catch { }
        }

        if (currentOperation?.cancelled) throw new Error('Operación cancelada');
        sendProgress(92, 'Verificando instalación...');

        // ── Detección 1: ¿creó versión en NUESTRO directorio? ────────────────
        const ourVersionsAfter = fs.existsSync(versionsDir) ? fs.readdirSync(versionsDir) : [];
        const newInOurDir = ourVersionsAfter.filter(d =>
            !ourVersionsBefore.has(d) && d.toLowerCase().includes('optifine')
        );
        if (newInOurDir.length > 0) {
            const installedId = newInOurDir[0];
            enrichOptiFineVersionJson(path.join(versionsDir, installedId, `${installedId}.json`), mcPath, sendLog);
            sendLog(`✅ OptiFine instalado: ${installedId}`);
            ensureLauncherProfiles(mcPath);
            try { fs.unlinkSync(jarPath); } catch { }
            sendProgress(100, 'OptiFine listo ✓');
            currentOperation = null;
            return { success: true, name: optifineFileName, mode: 'version', versionId: installedId };
        }

        // ── Detección 2: ¿creó versión en AppData (directorio estándar)? ─────
        if (fs.existsSync(defaultVersions)) {
            const newInAppData = fs.readdirSync(defaultVersions).filter(d =>
                !appDataVersionsBefore.has(d) && d.toLowerCase().includes('optifine')
            );
            for (const vid of newInAppData) {
                const srcDir = path.join(defaultVersions, vid);
                const dstDir = path.join(versionsDir, vid);
                if (!fs.existsSync(dstDir)) {
                    sendLog(`📦 Copiando OptiFine de AppData → ${mcPath}...`);
                    fs.mkdirSync(dstDir, { recursive: true });
                    for (const f of fs.readdirSync(srcDir)) {
                        fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
                    }
                    // Copiar librerías optifine (launchwrapper-of, etc.)
                    const srcLibs = path.join(defaultMcDir, 'libraries', 'optifine');
                    const dstLibs = path.join(mcPath, 'libraries', 'optifine');
                    if (fs.existsSync(srcLibs)) {
                        fs.mkdirSync(dstLibs, { recursive: true });
                        execSync(`xcopy "${srcLibs}" "${dstLibs}" /E /I /Y /Q`, { stdio: 'ignore' });
                    }
                    sendLog(`✅ OptiFine instalado: ${vid}`);
                    enrichOptiFineVersionJson(path.join(dstDir, `${vid}.json`), mcPath, sendLog);
                    ensureLauncherProfiles(mcPath);
                    try { fs.unlinkSync(jarPath); } catch { }
                    sendProgress(100, 'OptiFine listo ✓');
                    currentOperation = null;
                    return { success: true, name: optifineFileName, mode: 'version', versionId: vid };
                }
            }
        }

        // ── Detección 3: ¿Ya existía de una instalación previa? ──────────────
        const allNow = fs.existsSync(versionsDir) ? fs.readdirSync(versionsDir) : [];
        const existingOf = allNow.find(d =>
            d.toLowerCase().includes('optifine') && d.includes(mcVersion)
        );
        if (existingOf) {
            sendLog(`✅ Usando OptiFine ya instalado: ${existingOf}`);
            // Enriquecer el JSON por si tiene librerías sin URL (instalación previa)
            enrichOptiFineVersionJson(
                path.join(versionsDir, existingOf, `${existingOf}.json`), mcPath, sendLog);
            try { fs.unlinkSync(jarPath); } catch { }
            sendProgress(100, 'OptiFine listo ✓');
            currentOperation = null;
            return { success: true, name: optifineFileName, mode: 'version', versionId: existingOf };
        }

        throw new Error(
            `El instalador de OptiFine no pudo crear la versión.\n` +
            `Verifica que Minecraft ${mcVersion} esté instalado y que el juego de fondo esté cerrado.`
        );


    } catch (err) {
        sendLog(`❌ Error instalando OptiFine: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});


// ══ FORGE: Todas las versiones MC soportadas (desde promotions_slim.json) ══

ipcMain.handle('get-forge-mc-versions', async () => {
    try {
        sendLog('🔍 Cargando versiones de Forge soportadas...');
        const promos = JSON.parse(
            await httpsGet('https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json')
        );
        const versions = {};
        for (const [key, forgeVer] of Object.entries(promos.promos)) {
            const dashIdx = key.lastIndexOf('-');
            const mcVer = key.slice(0, dashIdx);
            const tag = key.slice(dashIdx + 1);
            if (!versions[mcVer]) versions[mcVer] = {};
            versions[mcVer][tag] = forgeVer;
        }
        const sorted = Object.keys(versions)
            .filter(v => /^\d+\.\d+(\.\d+)?$/.test(v))
            .sort((a, b) => {
                const pa = a.split('.').map(Number);
                const pb = b.split('.').map(Number);
                for (let i = 0; i < 3; i++) {
                    const diff = (pb[i] || 0) - (pa[i] || 0);
                    if (diff !== 0) return diff;
                }
                return 0;
            });
        const result = sorted.map(mcVer => ({
            mcVersion: mcVer,
            recommended: versions[mcVer].recommended || null,
            latest: versions[mcVer].latest || null
        }));
        sendLog(`✅ ${result.length} versiones de Minecraft con soporte Forge`);
        return result;
    } catch (err) {
        sendLog(`❌ Error cargando versiones Forge: ${err.message}`, 'error');
        return [];
    }
});

// ══ FORGE: Builds específicas para una MC version (Maven XML) ══
ipcMain.handle('get-forge-versions', async (event, mcVersion) => {
    try {
        sendLog(`🔍 Buscando versiones de Forge para ${mcVersion}…`);
        const xml = await httpsGet('https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml');
        const regex = new RegExp(`<version>${mcVersion.replace(/\./g, '\\.')}-([^<]+)</version>`, 'g');
        const matches = [...xml.matchAll(regex)];
        const versions = [...new Set(
            matches.map(m => m[1]).filter(v => !v.includes('_pre') && !v.includes('-pre') && !v.includes('-rc'))
        )].reverse();

        if (versions.length === 0) {
            sendLog(`⚠️ No se encontraron versiones de Forge para ${mcVersion}`);
            return [];
        }
        sendLog(`✅ ${versions.length} versiones de Forge para ${mcVersion}`);
        return versions.map(v => ({
            mcVersion,
            forgeVersion: v,
            fullVersion: `${mcVersion}-${v}`,
            downloadUrl: `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${v}/forge-${mcVersion}-${v}-installer.jar`

        }));
    } catch (err) {
        sendLog(`❌ Error buscando Forge: ${err.message}`, 'error');
        return [];
    }
});

ipcMain.handle('install-forge', async (event, forgeData) => {
    currentOperation = { type: 'forge', cancelled: false };

    try {
        const { mcVersion, forgeVersion, downloadUrl } = forgeData;
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });

        const installerName = `forge-${mcVersion}-${forgeVersion}-installer.jar`;
        const installerPath = path.join(tempDir, installerName);

        sendLog(`📥 Descargando Forge ${mcVersion}-${forgeVersion}…`);
        sendProgress(10, 'Descargando Forge…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        await downloadFile(downloadUrl, installerPath, p => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            sendProgress(10 + Math.floor(p * 0.5), `Descargando: ${p}%`);
        });

        sendLog(`✅ Descarga completada`);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        const javaExe = await ensureJava(mcVersion, s.javaPath);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        ensureLauncherProfiles(mcPath);
        sendProgress(70, 'Instalando Forge…');
        sendLog('🔧 Ejecutando instalador de Forge…');

        await new Promise((resolve, reject) => {
            const proc = spawn(javaExe, [
                '-jar', installerPath,
                '--installClient', mcPath
            ], { cwd: tempDir });

            currentOperation.process = proc;

            let output = '';
            proc.stdout.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.stderr.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.on('close', code => {
                if (currentOperation?.cancelled) {
                    reject(new Error('Operación cancelada'));
                } else if (code === 0 || output.toLowerCase().includes('success')) {
                    resolve();
                } else {
                    reject(new Error(`Instalador terminó con código ${code}`));
                }
            });

            setTimeout(() => {
                if (proc && !proc.killed) {
                    try { proc.kill(); } catch { }
                    resolve();
                }
            }, 300000);
        });

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        const versionsDir = path.join(mcPath, 'versions');

        // Buscar la versión de Forge instalada (varios formatos posibles)
        let installedForgeVer = null;
        if (fs.existsSync(versionsDir)) {
            const dirs = fs.readdirSync(versionsDir);
            // Buscar directorio que contenga 'forge' y la mcVersion
            installedForgeVer = dirs.find(d => {
                const dl = d.toLowerCase();
                return dl.includes('forge') && d.startsWith(mcVersion);
            });
            if (!installedForgeVer) {
                // Formato alternativo: puede no empezar con mcVersion exacta
                installedForgeVer = dirs.find(d => {
                    const dl = d.toLowerCase();
                    return dl.includes('forge') && dl.includes(mcVersion.split('.').slice(0, 2).join('.'));
                });
            }
        }

        try { fs.unlinkSync(installerPath); } catch { }

        if (!installedForgeVer) {
            // Forge a veces instala pero en directorio con nombre diferente - dar por bueno si salió code 0
            sendLog('⚠️ No se detectó directorio de Forge, pero el instalador terminó. Verificando...');
            // Intentar con el nombre estándar
            const stdId = `${mcVersion}-forge-${forgeVersion}`;
            sendProgress(100, 'Forge listo ✓');
            sendLog(`✅ Forge ${mcVersion}-${forgeVersion} instalado`);
            currentOperation = null;
            return { success: true, versionId: stdId };
        }

        sendProgress(100, 'Forge listo ✓');
        sendLog(`✅ Forge instalado como versión: ${installedForgeVer}`);
        currentOperation = null;
        return { success: true, versionId: installedForgeVer };

    } catch (err) {
        sendLog(`❌ Error instalando Forge: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});

// ── NEOFORGE INSTALLATION (NEW) ──────────────────────────────────
ipcMain.handle('get-neoforge-mc-versions', async () => {
    try {
        sendLog('🔍 Cargando versiones de NeoForge soportadas...');
        const mcMap = new Set();

        // 1. Fetch modern versions
        try {
            const xml = await httpsGet('https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml');
            const regex = /<version>([^<]+)<\/version>/g;
            const matches = [...xml.matchAll(regex)].map(m => m[1]);
            for (const v of matches) {
                if (v.includes('alpha') || v.includes('snapshot')) continue;
                const parts = v.split('.');
                if (parts.length >= 2) {
                    const minor = parts[0];
                    const patch = parts[1];
                    if (/^\d+$/.test(minor) && /^\d+$/.test(patch)) {
                        const mcVer = patch === '0' ? `1.${minor}` : `1.${minor}.${patch}`;
                        mcMap.add(mcVer);
                    }
                }
            }
        } catch (err) {
            sendLog(`⚠️ Error cargando neoforge modern XML: ${err.message}`, 'warn');
        }

        // 2. Fetch legacy versions (1.20.1)
        try {
            const xml = await httpsGet('https://maven.neoforged.net/releases/net/neoforged/forge/maven-metadata.xml');
            const regex = /<version>([^<]+)<\/version>/g;
            const matches = [...xml.matchAll(regex)].map(m => m[1]);
            for (const v of matches) {
                if (v.includes('alpha') || v.includes('snapshot')) continue;
                if (v.includes('47.1.')) {
                    mcMap.add('1.20.1');
                }
            }
        } catch (err) {
            sendLog(`⚠️ Error cargando neoforge legacy XML: ${err.message}`, 'warn');
        }

        const sorted = Array.from(mcMap).sort((a, b) => {
            const pa = a.split('.').map(Number);
            const pb = b.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                const diff = (pb[i] || 0) - (pa[i] || 0);
                if (diff !== 0) return diff;
            }
            return 0;
        });

        sendLog(`✅ ${sorted.length} versiones de Minecraft con soporte NeoForge`);
        return sorted;
    } catch (err) {
        sendLog(`❌ Error cargando versiones NeoForge: ${err.message}`, 'error');
        return [];
    }
});

ipcMain.handle('get-neoforge-versions', async (event, mcVersion) => {
    try {
        sendLog(`🔍 Buscando versiones de NeoForge para ${mcVersion}…`);
        
        if (mcVersion === '1.20.1') {
            const xml = await httpsGet('https://maven.neoforged.net/releases/net/neoforged/forge/maven-metadata.xml');
            const regex = /<version>([^<]+)<\/version>/g;
            const matches = [...xml.matchAll(regex)].map(m => m[1]);
            
            const filtered = matches.filter(v => {
                if (v.includes('alpha') || v.includes('snapshot')) return false;
                return v.includes('47.1.');
            }).reverse();
            
            sendLog(`✅ ${filtered.length} versiones de NeoForge para ${mcVersion}`);
            return filtered.map(v => {
                const fullVersion = v.startsWith('1.20.1-') ? v : `1.20.1-${v}`;
                return {
                    mcVersion,
                    neoforgeVersion: v,
                    downloadUrl: `https://maven.neoforged.net/releases/net/neoforged/forge/${fullVersion}/forge-${fullVersion}-installer.jar`
                };
            });
        } else {
            const xml = await httpsGet('https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml');
            const regex = /<version>([^<]+)<\/version>/g;
            const matches = [...xml.matchAll(regex)].map(m => m[1]);
            
            const parts = mcVersion.split('.');
            if (parts.length < 2) return [];
            const minor = parts[1];
            const patch = parts[2] || '0';
            const targetRegex = new RegExp(`^${minor}\\.${patch}\\.\\d+`);
            
            const filtered = matches.filter(v => {
                if (v.includes('alpha') || v.includes('snapshot')) return false;
                return targetRegex.test(v);
            }).reverse();
            
            sendLog(`✅ ${filtered.length} versiones de NeoForge para ${mcVersion}`);
            return filtered.map(v => ({
                mcVersion,
                neoforgeVersion: v,
                downloadUrl: `https://maven.neoforged.net/releases/net/neoforged/neoforge/${v}/neoforge-${v}-installer.jar`
            }));
        }
    } catch (err) {
        sendLog(`❌ Error buscando NeoForge: ${err.message}`, 'error');
        return [];
    }
});

ipcMain.handle('install-neoforge', async (event, nfData) => {
    currentOperation = { type: 'neoforge', cancelled: false };

    try {
        const { mcVersion, neoforgeVersion, downloadUrl } = nfData;
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });

        const installerName = `neoforge-${neoforgeVersion}-installer.jar`;
        const installerPath = path.join(tempDir, installerName);

        sendLog(`📥 Descargando NeoForge ${mcVersion}-${neoforgeVersion}…`);
        sendProgress(10, 'Descargando NeoForge…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        await downloadFile(downloadUrl, installerPath, p => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            sendProgress(10 + Math.floor(p * 0.5), `Descargando: ${p}%`);
        });

        sendLog(`✅ Descarga completada`);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        const javaExe = await ensureJava(mcVersion, s.javaPath);

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        ensureLauncherProfiles(mcPath);
        sendProgress(70, 'Instalando NeoForge…');
        sendLog('🔧 Ejecutando instalador de NeoForge…');

        await new Promise((resolve, reject) => {
            const proc = spawn(javaExe, [
                '-jar', installerPath,
                '--installClient', mcPath
            ], { cwd: tempDir });

            currentOperation.process = proc;

            let output = '';
            proc.stdout.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.stderr.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.on('close', code => {
                if (currentOperation?.cancelled) {
                    reject(new Error('Operación cancelada'));
                } else if (code === 0 || output.toLowerCase().includes('success')) {
                    resolve();
                } else {
                    reject(new Error(`Instalador terminó con código ${code}`));
                }
            });

            setTimeout(() => {
                if (proc && !proc.killed) {
                    try { proc.kill(); } catch { }
                    resolve();
                }
            }, 300000);
        });

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        const versionsDir = path.join(mcPath, 'versions');

        let installedNeoForgeVer = null;
        if (fs.existsSync(versionsDir)) {
            const dirs = fs.readdirSync(versionsDir);
            installedNeoForgeVer = dirs.find(d => {
                const dl = d.toLowerCase();
                return dl.includes('neoforge') && d.startsWith(mcVersion);
            });
            if (!installedNeoForgeVer) {
                installedNeoForgeVer = dirs.find(d => {
                    const dl = d.toLowerCase();
                    return dl.includes('neoforge') && dl.includes(mcVersion.split('.').slice(0, 2).join('.'));
                });
            }
        }

        try { fs.unlinkSync(installerPath); } catch { }

        if (!installedNeoForgeVer) {
            sendLog('⚠️ No se detectó directorio de NeoForge, pero el instalador terminó. Verificando...');
            const stdId = `${mcVersion}-neoforge-${neoforgeVersion}`;
            sendProgress(100, 'NeoForge listo ✓');
            sendLog(`✅ NeoForge ${mcVersion}-${neoforgeVersion} instalado`);
            currentOperation = null;
            return { success: true, versionId: stdId };
        }

        sendProgress(100, 'NeoForge listo ✓');
        sendLog(`✅ NeoForge instalado como versión: ${installedNeoForgeVer}`);
        currentOperation = null;
        return { success: true, versionId: installedNeoForgeVer };

    } catch (err) {
        sendLog(`❌ Error instalando NeoForge: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});

// ── FABRIC/SODIUM INSTALLATION (NEW) ──────────────────────────────
ipcMain.handle('check-fabric-available', async (event, mcVersion) => {
    try {
        sendLog(`🔍 Verificando Fabric disponible para ${mcVersion}...`);

        // Check Fabric API for available versions
        const fabricVersionsUrl = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`;
        const data = await httpsGet(fabricVersionsUrl);
        const versions = JSON.parse(data);

        if (versions && versions.length > 0) {
            sendLog(`✅ Fabric disponible para ${mcVersion}`);
            return { available: true, versions };
        } else {
            sendLog(`❌ Fabric NO disponible para ${mcVersion}`);
            return { available: false, error: `No hay Fabric para Minecraft ${mcVersion}` };
        }
    } catch (err) {
        sendLog(`⚠️ Error verificando Fabric: ${err.message}`);
        return { available: false, error: err.message };
    }
});

ipcMain.handle('auto-install-sodium', async (event, mcVersion) => {
    currentOperation = { type: 'sodium', cancelled: false };

    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const versionsDir = path.join(mcPath, 'versions');
        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });

        // Check if Fabric is available
        sendLog(`🔍 Verificando disponibilidad de Fabric para ${mcVersion}...`);
        sendProgress(5, 'Verificando Fabric...');

        const fabricCheck = await httpsGet(`https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`);
        const fabricVersions = JSON.parse(fabricCheck);

        if (!fabricVersions || fabricVersions.length === 0) {
            throw new Error(`Fabric no disponible para ${mcVersion}`);
        }

        const latestFabricLoader = fabricVersions[0].loader.version;

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        sendLog(`✅ Fabric Loader ${latestFabricLoader} encontrado`);
        sendProgress(10, 'Descargando Fabric Loader...');

        const fabricVersionId = `fabric-loader-${latestFabricLoader}-${mcVersion}`;
        const fabricDir = path.join(versionsDir, fabricVersionId);
        const isFabricInstalled = fs.existsSync(path.join(fabricDir, `${fabricVersionId}.json`));

        if (!isFabricInstalled) {
            // Download Fabric installer
            const fabricInstallerUrl = 'https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.1/fabric-installer-1.0.1.jar';
            const fabricInstallerPath = path.join(tempDir, 'fabric-installer.jar');

            await downloadFile(fabricInstallerUrl, fabricInstallerPath, p => {
                if (currentOperation.cancelled) throw new Error('Operación cancelada');
                sendProgress(10 + Math.floor(p * 0.3), `Descargando Fabric: ${p}%`);
            });

            if (currentOperation.cancelled) throw new Error('Operación cancelada');

            // Get Java
            sendProgress(45, 'Preparando Java...');
            const javaExe = await ensureJava(mcVersion, s.javaPath);

            if (currentOperation.cancelled) throw new Error('Operación cancelada');

            // Install Fabric
            ensureLauncherProfiles(mcPath);
            sendProgress(50, 'Instalando Fabric...');
            sendLog('🔧 Ejecutando instalador de Fabric...');

            await new Promise((resolve, reject) => {
                const proc = spawn(javaExe, [
                    '-jar', fabricInstallerPath,
                    'client', '-mcversion', mcVersion,
                    '-loader', latestFabricLoader,
                    '-dir', mcPath,
                    '-noprofile'
                ], { cwd: tempDir });

                currentOperation.process = proc;

            let output = '';
            proc.stdout.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.stderr.on('data', d => {
                const msg = d.toString().trim();
                if (msg) {
                    output += msg + '\n';
                    sendLog(`  ${msg}`);
                }
            });
            proc.on('close', code => {
                if (currentOperation?.cancelled) {
                    reject(new Error('Operación cancelada'));
                } else if (code === 0 || output.toLowerCase().includes('success') || output.toLowerCase().includes('done')) {
                    resolve();
                } else {
                    reject(new Error(`Instalador de Fabric terminó con código ${code}`));
                }
            });

                setTimeout(() => {
                    if (proc && !proc.killed) {
                        try { proc.kill(); } catch { }
                        resolve();
                    }
                }, 120000);
            });
            try { fs.unlinkSync(fabricInstallerPath); } catch { }
        } else {
            sendLog('✅ Fabric base ya estaba instalado, omitiendo descarga del instalador...');
            sendProgress(50, 'Fabric ya preparado');
        }

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        sendLog(`✅ Fabric validado correctamente`);
        sendProgress(60, 'Descargando Sodium y mods...');

        // Find Fabric version directory
        if (!fs.existsSync(fabricDir)) {
            throw new Error('La versión de Fabric no se creó correctamente');
        }

        // Fabric usa su propia carpeta de instancia → mods aislados por loader
        const fabricInstanceDir = getInstanceDir(mcPath, fabricVersionId);
        const modsDir = path.join(fabricInstanceDir, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });
        ensureLauncherProfiles(fabricInstanceDir);
        sendLog(`📂 Instancia Fabric: ${fabricInstanceDir}`);
        sendLog(`📂 Mods Fabric en: ${modsDir}`);

        // Download Sodium and complementary mods from Modrinth
        const modsToInstall = [
            { slug: 'fabric-api', name: 'Fabric API' }, // requerido por todos
            { slug: 'sodium', name: 'Sodium' },
            { slug: 'indium', name: 'Indium' }, // compatibilidad Sodium+Iris
            { slug: 'iris', name: 'Iris Shaders' },
            { slug: 'lithium', name: 'Lithium' },
            { slug: 'sodium-extra', name: 'Sodium Extra' },
            { slug: 'reeses-sodium-options', name: "Reese's Sodium Options" },
            { slug: 'modmenu', name: 'Mod Menu' }, // ver mods en juego
        ];

        let modsInstalled = 0;
        for (const mod of modsToInstall) {
            try {
                if (currentOperation.cancelled) throw new Error('Operación cancelada');

                sendLog(`📥 Descargando ${mod.name}...`);

                // Get mod info from Modrinth
                const projectUrl = `https://api.modrinth.com/v2/project/${mod.slug}`;
                const projectData = await httpsGet(projectUrl);
                const project = JSON.parse(projectData);

                // Get versions for this MC version
                const versionsUrl = `https://api.modrinth.com/v2/project/${project.id}/version?game_versions=["${mcVersion}"]&loaders=["fabric"]`;
                const versionsData = await httpsGet(versionsUrl);
                const versions = JSON.parse(versionsData);

                if (versions && versions.length > 0) {
                    const latestVersion = versions[0];
                    const primaryFile = latestVersion.files.find(f => f.primary) || latestVersion.files[0];

                    const modPath = path.join(modsDir, primaryFile.filename);
                    await downloadFile(primaryFile.url, modPath, () => { });

                    modsInstalled++;
                    sendProgress(60 + Math.floor((modsInstalled / modsToInstall.length) * 35),
                        `Instalando mods: ${modsInstalled}/${modsToInstall.length}`);
                    sendLog(`✅ ${mod.name} instalado`);
                } else {
                    sendLog(`⚠️ No hay versión de ${mod.name} para MC ${mcVersion}`);
                }
            } catch (err) {
                sendLog(`⚠️ Error instalando ${mod.name}: ${err.message}`);
            }
        }

        sendProgress(100, 'Sodium + Fabric listo ✓');
        sendLog(`✅ Fabric con Sodium instalado correctamente`);
        sendLog(`📦 ${modsInstalled} mods instalados: Sodium, Iris, Lithium, etc.`);

        currentOperation = null;
        return {
            success: true,
            versionId: fabricVersionId,
            modsInstalled
        };

    } catch (err) {
        sendLog(`❌ Error instalando Sodium/Fabric: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});

// ── MODPACKS HELPERS & HANDLERS ────────────────────────────────────

async function ensureFabricLoader(mcVersion, loaderVersion) {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const fabricVersionId = `fabric-loader-${loaderVersion}-${mcVersion}`;
    const fabricDir = path.join(mcPath, 'versions', fabricVersionId);
    const isFabricInstalled = fs.existsSync(path.join(fabricDir, `${fabricVersionId}.json`));
    if (isFabricInstalled) return fabricVersionId;

    sendLog(`🔧 Instalando Fabric Loader ${loaderVersion} para MC ${mcVersion}...`);
    const tempDir = path.join(BASE_DATA_DIR, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const fabricInstallerUrl = 'https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.1/fabric-installer-1.0.1.jar';
    const fabricInstallerPath = path.join(tempDir, 'fabric-installer-tmp.jar');
    await downloadFile(fabricInstallerUrl, fabricInstallerPath);

    const javaExe = await ensureJava(mcVersion, s.javaPath);
    await new Promise((resolve, reject) => {
        const proc = spawn(javaExe, [
            '-jar', fabricInstallerPath,
            'client', '-mcversion', mcVersion,
            '-loader', loaderVersion,
            '-dir', mcPath,
            '-noprofile'
        ], { cwd: tempDir });
        proc.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`El instalador de Fabric falló con código ${code}`));
        });
    });
    try { fs.unlinkSync(fabricInstallerPath); } catch {}
    return fabricVersionId;
}

async function ensureNeoForgeLoader(mcVersion, neoforgeVersion) {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    let installedNeoForgeVer = null;
    
    if (fs.existsSync(versionsDir)) {
        const dirs = fs.readdirSync(versionsDir);
        installedNeoForgeVer = dirs.find(d => {
            const dl = d.toLowerCase();
            return dl.includes('neoforge') && dl.includes(neoforgeVersion.toLowerCase()) && fs.existsSync(path.join(versionsDir, d, `${d}.json`)) && (() => { try { return JSON.parse(fs.readFileSync(path.join(versionsDir, d, `${d}.json`), 'utf8')).inheritsFrom; } catch { return false; } })();
        });
    }
    if (installedNeoForgeVer) {
        // Ensure JSON is named correctly (NeoForge installer uses {mcVersion}.json)
        const vDir = path.join(versionsDir, installedNeoForgeVer);
        const expectedJson = path.join(vDir, `${installedNeoForgeVer}.json`);
        const mcVersionJson = path.join(vDir, `${mcVersion}.json`);
        if (!fs.existsSync(expectedJson) && fs.existsSync(mcVersionJson)) {
            fs.renameSync(mcVersionJson, expectedJson);
            sendLog(`📝 Corrigiendo nombre del JSON: ${mcVersion}.json → ${installedNeoForgeVer}.json`);
        }
        // Ensure critical JVM args are also present in pre-existing versions
        ensureCriticalNeoForgeJvmArgs(expectedJson);
        return installedNeoForgeVer;
    }

    sendLog(`🔧 Instalando NeoForge ${neoforgeVersion} para MC ${mcVersion}...`);
    const tempDir = path.join(BASE_DATA_DIR, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const installerPath = path.join(tempDir, `neoforge-${neoforgeVersion}-installer.jar`);
    
    let downloadUrl;
    if (mcVersion === '1.20.1') {
        const fullVersion = neoforgeVersion.startsWith('1.20.1-') ? neoforgeVersion : `1.20.1-${neoforgeVersion}`;
        downloadUrl = `https://maven.neoforged.net/releases/net/neoforged/forge/${fullVersion}/forge-${fullVersion}-installer.jar`;
    } else {
        downloadUrl = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${neoforgeVersion}/neoforge-${neoforgeVersion}-installer.jar`;
    }
    
    await downloadFile(downloadUrl, installerPath);
    const javaExe = await ensureJava(mcVersion, s.javaPath);
    await new Promise((resolve, reject) => {
        const proc = spawn(javaExe, [
            '-jar', installerPath,
            '--installClient', mcPath
        ], { cwd: tempDir });
        let output = '';
        proc.stdout.on('data', d => { output += d.toString(); });
        proc.stderr.on('data', d => { output += d.toString(); });
        proc.on('close', code => {
            if (code === 0 || output.toLowerCase().includes('success')) resolve();
            else reject(new Error(`El instalador de NeoForge falló con código ${code}`));
        });
    });
    try { fs.unlinkSync(installerPath); } catch {}
    
    // Fix JSON naming after NeoForge installer (it uses {mcVersion}.json instead of {folderName}.json)
    
if (fs.existsSync(versionsDir)) {
        const dirs = fs.readdirSync(versionsDir);
        installedNeoForgeVer = dirs.find(d => {
            const dl = d.toLowerCase();
            return dl.includes('neoforge') && dl.includes(neoforgeVersion.toLowerCase()) && fs.existsSync(path.join(versionsDir, d, `${d}.json`)) && (() => { try { return JSON.parse(fs.readFileSync(path.join(versionsDir, d, `${d}.json`), 'utf8')).inheritsFrom; } catch { return false; } })();
        });
    }
    // Write critical JVM args to the version JSON after fresh NeoForge install
    if (installedNeoForgeVer) {
        const vJsonPath = path.join(versionsDir, installedNeoForgeVer, `${installedNeoForgeVer}.json`);
        if (ensureCriticalNeoForgeJvmArgs(vJsonPath)) {
            sendLog('📝 JVM args críticos inyectados en version JSON tras instalación de NeoForge');
        }
    }
    return installedNeoForgeVer || (mcVersion === '1.20.1' ? `1.20.1-neoforge-${neoforgeVersion}` : `neoforge-${neoforgeVersion}`);
}

async function ensureForgeLoader(mcVersion, forgeVersion) {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    let installedForgeVer = null;
    
    if (fs.existsSync(versionsDir)) {
        const dirs = fs.readdirSync(versionsDir);
        installedForgeVer = dirs.find(d => {
            const dl = d.toLowerCase();
            return dl.includes('forge') && dl.includes(forgeVersion) && dl.includes(mcVersion) && fs.existsSync(path.join(versionsDir, d, `${d}.json`));
        });
    }
    if (installedForgeVer) return installedForgeVer;

    sendLog(`🔧 Instalando Forge ${forgeVersion} para MC ${mcVersion}...`);
    const tempDir = path.join(BASE_DATA_DIR, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const installerPath = path.join(tempDir, `forge-${mcVersion}-${forgeVersion}-installer.jar`);
    
    const versionString = forgeVersion.includes(mcVersion) ? forgeVersion : `${mcVersion}-${forgeVersion}`;
    const downloadUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${versionString}/forge-${versionString}-installer.jar`;
    
    await downloadFile(downloadUrl, installerPath);
    const javaExe = await ensureJava(mcVersion, s.javaPath);
    await new Promise((resolve, reject) => {
        const proc = spawn(javaExe, [
            '-jar', installerPath,
            '--installClient', mcPath
        ], { cwd: tempDir });
        let output = '';
        proc.stdout.on('data', d => { output += d.toString(); });
        proc.stderr.on('data', d => { output += d.toString(); });
        proc.on('close', code => {
            if (code === 0 || output.toLowerCase().includes('success')) resolve();
            else reject(new Error(`El instalador de Forge falló con código ${code}`));
        });
    });
    try { fs.unlinkSync(installerPath); } catch {}
    
    if (fs.existsSync(versionsDir)) {
        const dirs = fs.readdirSync(versionsDir);
        installedForgeVer = dirs.find(d => {
            const dl = d.toLowerCase();
            return dl.includes('forge') && dl.includes(forgeVersion) && dl.includes(mcVersion) && fs.existsSync(path.join(versionsDir, d, `${d}.json`));
        });
    }
    return installedForgeVer || `${mcVersion}-forge-${forgeVersion}`;
}

// ── Helper: ensure critical NeoForge/Forge JVM args are in a version JSON ──
function ensureCriticalNeoForgeJvmArgs(jsonPath) {
    try {
        if (!fs.existsSync(jsonPath)) return false;
        const vJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        // Handle both modern format (arguments object) and legacy format (arguments array)
        if (!vJson.arguments || Array.isArray(vJson.arguments)) {
            vJson.arguments = {};
        }
        // Guard: if jvm exists but is not an array, log warning and return (prevent data loss)
        if (vJson.arguments.jvm && !Array.isArray(vJson.arguments.jvm)) {
            sendLog('⚠️ Version JSON tiene arguments.jvm no-array, no se modifica', 'warn');
            return false;
        }
        if (!vJson.arguments.jvm) {
            vJson.arguments.jvm = [];
        }
        const criticalArgs = NEOFORGE_CRITICAL_JVM_ARGS;
        let changed = false;
        for (const arg of criticalArgs) {
            if (!vJson.arguments.jvm.includes(arg)) {
                vJson.arguments.jvm.push(arg);
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(jsonPath, JSON.stringify(vJson, null, 2), 'utf8');
            return true;
        }
        return false;
    } catch (e) {
        sendLog(`⚠️ No se pudieron inyectar JVM args en version JSON: ${e.message}`, 'warn');
        return false;
    }
}

ipcMain.handle('import-modpack', async (event) => {
    try {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
                { name: 'Modpacks', extensions: ['zip', 'mrpack'] }
            ]
        });

        if (result.canceled || !result.filePaths[0]) {
            return { success: false, error: 'Cancelado' };
        }

        const modpackPath = result.filePaths[0];
        const fileName = path.basename(modpackPath);

        sendLog(`📦 Importando modpack: ${fileName}`);
        sendProgress(10, 'Leyendo modpack...');

        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');

        const zip = new AdmZip(modpackPath);
        const zipEntries = zip.getEntries();

        let modpackType = 'unknown';
        let manifest = null;

        const manifestEntry = zipEntries.find(e => e.entryName === 'manifest.json');
        if (manifestEntry) {
            modpackType = 'curseforge';
            manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
        }

        const modrinthEntry = zipEntries.find(e => e.entryName === 'modrinth.index.json');
        if (modrinthEntry) {
            modpackType = 'modrinth';
            manifest = JSON.parse(modrinthEntry.getData().toString('utf8'));
        }

        if (!manifest) {
            throw new Error('Formato de modpack no reconocido. Solo se soportan modpacks de CurseForge y Modrinth.');
        }

        sendLog(`✅ Modpack detectado: ${modpackType.toUpperCase()}`);
        sendProgress(20, 'Extrayendo archivos...');

        const instanceName = manifest.name || fileName.replace(/\.(zip|mrpack)$/, '');
        const instancePath = path.join(mcPath, 'instances', instanceName);
        fs.mkdirSync(instancePath, { recursive: true });

        if (modpackType === 'curseforge') {
            const mcVersion = manifest.minecraft.version;
            const forgeVersion = manifest.minecraft.modLoaders?.[0]?.id?.replace('forge-', '');

            sendLog(`Minecraft: ${mcVersion}, Forge: ${forgeVersion || 'N/A'}`);

            const overridesPrefix = manifest.overrides || 'overrides';
            zipEntries.forEach(entry => {
                if (entry.entryName.startsWith(overridesPrefix + '/')) {
                    const relativePath = entry.entryName.substring(overridesPrefix.length + 1);
                    const targetPath = path.join(instancePath, relativePath);

                    if (entry.isDirectory) {
                        fs.mkdirSync(targetPath, { recursive: true });
                    } else {
                        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                        fs.writeFileSync(targetPath, entry.getData());
                    }
                }
            });

            sendProgress(50, 'Descargando mods...');

            const modsDir = path.join(instancePath, 'mods');
            fs.mkdirSync(modsDir, { recursive: true });

            let downloaded = 0;
            for (const file of manifest.files) {
                try {
                    const modUrl = `https://www.curseforge.com/api/v1/mods/${file.projectID}/files/${file.fileID}/download`;
                    const modPath = path.join(modsDir, `mod_${file.fileID}.jar`);

                    await downloadFile(modUrl, modPath, () => { });
                    downloaded++;
                    sendProgress(50 + Math.floor((downloaded / manifest.files.length) * 40), `Descargando mods: ${downloaded}/${manifest.files.length}`);
                } catch (err) {
                    sendLog(`⚠️ Error descargando mod ${file.projectID}: ${err.message}`);
                }
            }

            // Write instance.json metadata
            const loaderId = manifest.minecraft.modLoaders?.[0]?.id || '';
            const isFabric = loaderId.toLowerCase().includes('fabric');
            const isNeoForge = loaderId.toLowerCase().includes('neoforge');
            const loaderVer = loaderId.replace(/^(forge-|fabric-|neoforge-)/i, '');
            const metadata = {
                name: instanceName,
                mcVersion,
                loader: isFabric ? 'fabric' : (isNeoForge ? 'neoforge' : (loaderId ? 'forge' : 'vanilla')),
                loaderVersion: loaderVer,
                iconUrl: '',
                screenshotUrl: '',
                description: 'Importado localmente desde CurseForge.'
            };
            fs.writeFileSync(path.join(instancePath, 'instance.json'), JSON.stringify(metadata, null, 2));

            sendProgress(100, 'Modpack importado ✓');
            sendLog(`✅ Modpack "${instanceName}" importado correctamente`);

            return {
                success: true,
                name: instanceName,
                mcVersion,
                forgeVersion,
                path: instancePath
            };

        } else if (modpackType === 'modrinth') {
            const mcVersion = manifest.dependencies?.minecraft;
            const forgeVersion = manifest.dependencies?.forge;

            sendLog(`Minecraft: ${mcVersion}, Forge: ${forgeVersion || 'Fabric/Quilt'}`);

            zip.extractAllTo(instancePath, true);

            sendProgress(50, 'Descargando mods...');

            const modsDir = path.join(instancePath, 'mods');
            fs.mkdirSync(modsDir, { recursive: true });

            let downloaded = 0;
            for (const file of manifest.files) {
                try {
                    const modPath = path.join(modsDir, file.path.split('/').pop());
                    await downloadFile(file.downloads[0], modPath, () => { });
                    downloaded++;
                    sendProgress(50 + Math.floor((downloaded / manifest.files.length) * 40), `Descargando mods: ${downloaded}/${manifest.files.length}`);
                } catch (err) {
                    sendLog(`⚠️ Error descargando mod: ${err.message}`);
                }
            }

            // Write instance.json metadata
            const fabricVer = manifest.dependencies?.['fabric-loader'] || manifest.dependencies?.fabric;
            const neoforgeVer = manifest.dependencies?.neoforge;
            const forgeVer = manifest.dependencies?.forge;
            const metadata = {
                name: instanceName,
                mcVersion,
                loader: fabricVer ? 'fabric' : (neoforgeVer ? 'neoforge' : (forgeVer ? 'forge' : 'vanilla')),
                loaderVersion: fabricVer || neoforgeVer || forgeVer || '',
                iconUrl: '',
                screenshotUrl: '',
                description: 'Importado localmente desde Modrinth.'
            };
            fs.writeFileSync(path.join(instancePath, 'instance.json'), JSON.stringify(metadata, null, 2));

            sendProgress(100, 'Modpack importado ✓');
            sendLog(`✅ Modpack "${instanceName}" importado correctamente`);

            return {
                success: true,
                name: instanceName,
                mcVersion,
                forgeVersion,
                path: instancePath
            };
        }

    } catch (err) {
        sendLog(`❌ Error importando modpack: ${err.message}`, 'error');
        sendProgress(0, '');
        return { success: false, error: err.message };
    }
});

ipcMain.handle('install-fussionborn', async () => {
    currentOperation = { type: 'fussionborn', cancelled: false };

    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const instancesDir = path.join(mcPath, 'instances');
        const fussionbornDir = path.join(instancesDir, 'Fussionborn');

        fs.mkdirSync(instancesDir, { recursive: true });

        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });

        const tempZipPath = path.join(tempDir, 'fussionborn.zip');
        const downloadUrl = s.fussionbornDownloadUrl || 'https://pub-d38529ebbdbe4598b4d3d552ffc4246f.r2.dev/FUSSIONBORN.zip';

        sendLog('📥 Descargando Fussionborn modpack desde la nube…');
        sendProgress(10, 'Descargando Fussionborn…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        await downloadFile(downloadUrl, tempZipPath, p => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            sendProgress(10 + Math.floor(p * 0.7), `Descargando: ${p}%`);
        });

        sendLog('✅ Descarga completada');

        sendProgress(80, 'Instalando Fussionborn…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // Extract using Expand-Archive -Force (supports files > 2 GiB, handles existing files natively on PS 5.1+)
        sendLog('📦 Extrayendo Fussionborn modpack (esto puede tomar un momento debido a su tamaño)...');
        const { execFileSync } = require('child_process');
        fs.mkdirSync(fussionbornDir, { recursive: true });
        const zipSrc = tempZipPath.replace(/\\/g, '\\\\');
        const zipDest = fussionbornDir.replace(/\\/g, '\\\\');
        const psScript = `$ErrorActionPreference='Stop'; Expand-Archive -Path '${zipSrc}' -DestinationPath '${zipDest}' -Force`;
        const psExe = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
        try {
            execFileSync(psExe, ['-NoProfile', '-NonInteractive', '-Command', psScript], { timeout: 1800000 });
        } catch (psErr) {
            // Fallback: try powershell from PATH
            execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript], { timeout: 1800000 });
        }

        try { fs.unlinkSync(tempZipPath); } catch {}

        // ── MOVE VERSIONS, LIBRARIES AND ASSETS TO THE GLOBAL FOLDERS ────────────────
        const mergeFolderToRoot = (srcFolder, destFolder) => {
            if (fs.existsSync(srcFolder)) {
                sendLog(`📦 Integrando directorio ${path.basename(srcFolder)} al sistema global...`);
                fs.mkdirSync(destFolder, { recursive: true });
                try {
                    fs.cpSync(srcFolder, destFolder, { recursive: true, force: true });
                    fs.rmSync(srcFolder, { recursive: true, force: true });
                } catch (e) {
                    sendLog(`⚠️ Advertencia integrando ${path.basename(srcFolder)}: ${e.message}`, 'warn');
                }
            }
        };

        mergeFolderToRoot(path.join(fussionbornDir, 'versions'), path.join(mcPath, 'versions'));
        mergeFolderToRoot(path.join(fussionbornDir, 'libraries'), path.join(mcPath, 'libraries'));
        mergeFolderToRoot(path.join(fussionbornDir, 'assets'), path.join(mcPath, 'assets'));

        // Clean up metadata from other launchers
        try {
            const xmclJson = path.join(fussionbornDir, 'xmcl.json');
            if (fs.existsSync(xmclJson)) fs.unlinkSync(xmclJson);
        } catch {}

        // Merge overrides folder (config, mods, resourcepacks, kubejs, schematics, etc.) to instance root
        const overridesDir = path.join(fussionbornDir, 'overrides');
        if (fs.existsSync(overridesDir)) {
            sendLog('📦 Integrando overrides (config, mods, resourcepacks, etc.)...');
            try {
                fs.cpSync(overridesDir, fussionbornDir, { recursive: true, force: true });
                fs.rmSync(overridesDir, { recursive: true, force: true });
                sendLog('✅ Overrides integrados correctamente.');
            } catch (e) {
                sendLog(`⚠️ Advertencia integrando overrides: ${e.message}`, 'warn');
            }
        }

        // Download mods from CurseForge using the manifest.json
        // The zip includes a manifest.json listing ALL mods with projectID/fileID
        // NOTE: mods in overrides/mods/ are removed before downloading to avoid duplicates
        const manifestJsonPath = path.join(fussionbornDir, 'manifest.json');
        const modsDir = path.join(fussionbornDir, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });
        if (fs.existsSync(manifestJsonPath)) {
            try {
                const manifestData = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
                const modFiles = manifestData.files || [];
                if (modFiles.length > 0) {
                    // Download missing mods from CurseForge
                    const existingMods = new Set();
                    try { fs.readdirSync(modsDir).forEach(f => existingMods.add(f.toLowerCase())); } catch {}
                    const missingMods = modFiles.filter(f => {
                        const pattern = `mod_${f.fileID}.jar`;
                        return !existingMods.has(pattern.toLowerCase());
                    });
                    if (missingMods.length > 0) {
                        sendLog(`📥 Descargando ${missingMods.length} mods desde CurseForge...`);
                        let downloaded = 0;
                        for (const modFile of missingMods) {
                            if (currentOperation.cancelled) throw new Error('Operación cancelada');
                            try {
                                const modUrl = `https://www.curseforge.com/api/v1/mods/${modFile.projectID}/files/${modFile.fileID}/download`;
                                const modPath = path.join(modsDir, `mod_${modFile.fileID}.jar`);
                                await downloadFile(modUrl, modPath);
                                downloaded++;
                                if (downloaded % 20 === 0) {
                                    sendProgress(80 + Math.floor((downloaded / missingMods.length) * 15), `Descargando mods: ${downloaded}/${missingMods.length}`);
                                }
                            } catch (modErr) {
                                sendLog(`⚠️ Error descargando mod ${modFile.projectID}/${modFile.fileID}: ${modErr.message}`, 'warn');
                            }
                        }
                        sendLog(`✅ ${downloaded}/${missingMods.length} mods descargados correctamente.`);
                        // Clean up original-named JARs from overrides that are now superseded by mod_*.jar downloads
                        try {
                            const allMods = new Set();
                            for (const mf of modFiles) {
                                allMods.add(`mod_${mf.fileID}.jar`.toLowerCase());
                            }
                            const afterFiles = fs.readdirSync(modsDir);
                            for (const f of afterFiles) {
                                if (f.endsWith('.jar') && !f.startsWith('mod_')) {
                                    fs.unlinkSync(path.join(modsDir, f));
                                }
                            }
                        } catch {}
                    } else {
                        sendLog('✅ Todos los mods ya están en la instancia.');
                    }
                }
            } catch (manifestErr) {
                sendLog(`⚠️ Error procesando manifest.json: ${manifestErr.message}`, 'warn');
            }
        }

        // Write instance.json metadata specifying Minecraft 1.21.1 and NeoForge 21.1.233
        const instanceJsonPath = path.join(fussionbornDir, 'instance.json');
        const instanceMeta = {
            name: "Fussionborn",
            mcVersion: "1.21.1",
            loader: "neoforge",
            loaderVersion: "21.1.233",
            iconUrl: "fussionborn_logo.png",
            screenshotUrl: "fussionborn_gameplay1.png",
            description: "Fussionborn official medieval adventure modpack."
        };
        fs.writeFileSync(instanceJsonPath, JSON.stringify(instanceMeta, null, 2), 'utf8');

        sendProgress(100, 'Fussionborn listo ✓');
        sendLog('✅ Fussionborn instalado y configurado correctamente.');
        currentOperation = null;
        return { success: true };

    } catch (err) {
        sendLog(`❌ Error instalando Fussionborn: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-installed-modpacks', async (event) => {
    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const instancesDir = path.join(mcPath, 'instances');
        if (!fs.existsSync(instancesDir)) return [];

        const dirs = fs.readdirSync(instancesDir);
        const modpacks = [];

        for (const dirName of dirs) {
            const instancePath = path.join(instancesDir, dirName);
            if (!fs.statSync(instancePath).isDirectory()) continue;

            // Skip default loader instances (fabric-* and forge-*) to only show modpacks
            if (dirName.startsWith('fabric-') || dirName.startsWith('forge-')) continue;

            const instanceJsonPath = path.join(instancePath, 'instance.json');
            if (fs.existsSync(instanceJsonPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(instanceJsonPath, 'utf8'));
                    modpacks.push({
                        folderName: dirName,
                        name: meta.name || dirName,
                        mcVersion: meta.mcVersion,
                        loader: meta.loader,
                        loaderVersion: meta.loaderVersion,
                        iconUrl: meta.iconUrl || '',
                        screenshotUrl: meta.screenshotUrl || '',
                        description: meta.description || ''
                    });
                } catch (e) {
                    modpacks.push(getFallbackInstanceMeta(dirName));
                }
            } else {
                const modsDir = path.join(instancePath, 'mods');
                if (fs.existsSync(modsDir)) {
                    modpacks.push(getFallbackInstanceMeta(dirName));
                }
            }
        }
        return modpacks;
    } catch (err) {
        sendLog(`Error listando modpacks: ${err.message}`, 'error');
        return [];
    }
});

function getFallbackInstanceMeta(dirName) {
    return {
        folderName: dirName,
        name: dirName,
        mcVersion: 'Desconocido',
        loader: 'Desconocido',
        loaderVersion: '',
        iconUrl: '',
        screenshotUrl: '',
        description: 'Instancia local sin metadatos.'
    };
}

ipcMain.handle('delete-modpack', async (event, folderName) => {
    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const instancePath = path.join(mcPath, 'instances', folderName);
        if (fs.existsSync(instancePath)) {
            fs.rmSync(instancePath, { recursive: true, force: true });
            sendLog(`🗑️ Modpack eliminado: ${folderName}`);
            return { success: true };
        }
        return { success: false, error: 'No existe la carpeta' };
    } catch (err) {
        sendLog(`❌ Error eliminando modpack: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
});

function httpsGetWithHeaders(url, headers = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const attempt = (reqUrl, redirectCount = 0) => {
            if (redirectCount > 10) return reject(new Error('Demasiados redirects'));
            const lib = reqUrl.startsWith('https') ? https : http;
            const finalHeaders = Object.assign({
                'User-Agent': 'Mozilla/5.0 NebulaLauncher/1.0'
            }, headers);
            
            const req = lib.get(reqUrl, { headers: finalHeaders }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return attempt(res.headers.location, redirectCount + 1);
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} desde ${reqUrl}`));
                }
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve(data));
                res.on('error', reject);
            });
            req.on('error', reject);
            req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error(`Timeout (${timeoutMs / 1000}s)`)); });
        };
        attempt(url);
    });
}

async function installCurseForgeModpack(projectId, title, iconUrl, screenshotUrl, description) {
    currentOperation = { type: 'install-modpack', cancelled: false };
    try {
        sendLog(`📥 Obteniendo información de "${title}" desde CurseForge...`);
        sendProgress(5, 'Obteniendo archivos...');

        const CF_API_KEY = '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm';
        const filesUrl = `https://api.curseforge.com/v1/mods/${projectId}/files`;
        const headers = { 'x-api-key': CF_API_KEY };
        
        const filesData = JSON.parse(await httpsGetWithHeaders(filesUrl, headers));
        if (!filesData.data || filesData.data.length === 0) {
            throw new Error('No se encontraron archivos para este modpack.');
        }

        // Sort files by ID descending to ensure we get the latest file version
        filesData.data.sort((a, b) => b.id - a.id);
        const latestFile = filesData.data[0];
        const downloadUrl = latestFile.downloadUrl;
        if (!downloadUrl) {
            throw new Error('El modpack no permite descargas directas automatizadas desde la API de CurseForge.');
        }

        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        const tempZipPath = path.join(tempDir, `modpack-${projectId}.zip`);

        sendLog(`📥 Descargando archivo del modpack: ${latestFile.displayName}...`);
        sendProgress(10, 'Descargando modpack...');
        await downloadFile(downloadUrl, tempZipPath, p => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            sendProgress(10 + Math.floor(p * 0.15), `Descargando modpack: ${p}%`);
        });

        sendLog(`📦 Instalando modpack...`);
        sendProgress(25, 'Extrayendo archivos...');

        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        
        const cleanName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
        const instancePath = path.join(mcPath, 'instances', cleanName);
        fs.mkdirSync(instancePath, { recursive: true });

        const zip = new AdmZip(tempZipPath);
        const zipEntries = zip.getEntries();

        const manifestEntry = zipEntries.find(e => e.entryName === 'manifest.json');
        if (!manifestEntry) {
            throw new Error('No se encontró el manifest.json en el modpack de CurseForge.');
        }

        const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
        const mcVersion = manifest.minecraft.version;
        const loaderId = manifest.minecraft.modLoaders?.[0]?.id || '';
        const isFabric = loaderId.toLowerCase().includes('fabric');
        const isNeoForge = loaderId.toLowerCase().includes('neoforge');
        const loaderVer = loaderId.replace(/^(forge-|fabric-|neoforge-)/i, '');

        sendLog(`Minecraft: ${mcVersion}, Loader: ${isFabric ? 'Fabric ' + loaderVer : (isNeoForge ? 'NeoForge ' + loaderVer : (loaderId ? 'Forge ' + loaderVer : 'Vanilla'))}`);

        const overridesPrefix = manifest.overrides || 'overrides';
        zipEntries.forEach(entry => {
            if (entry.entryName.startsWith(overridesPrefix + '/')) {
                const relativePath = entry.entryName.substring(overridesPrefix.length + 1);
                const targetPath = path.join(instancePath, relativePath);

                if (entry.isDirectory) {
                    fs.mkdirSync(targetPath, { recursive: true });
                } else {
                    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                    fs.writeFileSync(targetPath, entry.getData());
                }
            }
        });

        sendProgress(40, 'Descargando mods...');

        const modsDir = path.join(instancePath, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });

        let downloaded = 0;
        const totalFiles = manifest.files.length;
        
        for (const file of manifest.files) {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            
            try {
                const modUrl = `https://www.curseforge.com/api/v1/mods/${file.projectID}/files/${file.fileID}/download`;
                const modPath = path.join(modsDir, `mod_${file.fileID}.jar`);

                await downloadFile(modUrl, modPath, () => { });
                downloaded++;
                sendProgress(40 + Math.floor((downloaded / totalFiles) * 55), `Descargando mods: ${downloaded}/${totalFiles}`);
            } catch (err) {
                sendLog(`⚠️ Error descargando mod ${file.projectID}: ${err.message}`);
            }
        }

        try { fs.unlinkSync(tempZipPath); } catch {}

        const metadata = {
            name: title,
            mcVersion,
            loader: isFabric ? 'fabric' : (isNeoForge ? 'neoforge' : (loaderId ? 'forge' : 'vanilla')),
            loaderVersion: loaderVer,
            iconUrl,
            screenshotUrl,
            description
        };
        fs.writeFileSync(path.join(instancePath, 'instance.json'), JSON.stringify(metadata, null, 2));

        sendLog(`✅ Modpack "${title}" instalado correctamente.`);
        sendProgress(100, 'Instalación completada ✓');
        currentOperation = null;
        return { success: true, name: title };

    } catch (err) {
        sendLog(`❌ Error instalando modpack: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
}

ipcMain.handle('search-modpacks', async (event, { query, platform = 'all' }) => {
    const results = [];
    const debugPath = 'C:\\Users\\renee\\Documents\\Web\\xd\\search_debug.txt';
    
    const logDebug = (msg) => {
        try {
            fs.appendFileSync(debugPath, `[${new Date().toISOString()}] ${msg}\n`, 'utf8');
        } catch (e) {}
    };

    // Initialize/clear debug log for this search
    try { fs.writeFileSync(debugPath, `--- Search query: "${query}", platform: "${platform}" ---\n`, 'utf8'); } catch (e) {}

    // Search Modrinth
    if (platform === 'all' || platform === 'modrinth') {
        try {
            logDebug('Starting Modrinth search...');
            const limit = platform === 'modrinth' ? 25 : 15;
            const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=[["project_type:modpack"]]&limit=${limit}&index=downloads`;
            logDebug(`Modrinth URL: ${url}`);
            const resData = await httpsGet(url);
            logDebug(`Modrinth response length: ${resData.length}`);
            const searchResult = JSON.parse(resData);
            logDebug(`Modrinth hits count: ${searchResult.hits ? searchResult.hits.length : 0}`);
            searchResult.hits.forEach(h => {
                let screenshot = '';
                if (h.featured_gallery) {
                    screenshot = h.featured_gallery;
                } else if (h.gallery && h.gallery.length > 0) {
                    screenshot = h.gallery[0];
                }
                results.push({
                    source: 'modrinth',
                    projectId: h.project_id,
                    title: h.title,
                    description: h.description,
                    iconUrl: h.icon_url || '',
                    screenshotUrl: screenshot,
                    categories: h.categories || [],
                    versions: h.versions || []
                });
            });
        } catch (err) {
            logDebug(`⚠️ Modrinth error: ${err.message}`);
            sendLog(`⚠️ Error buscando en Modrinth: ${err.message}`);
        }
    }

    // Search CurseForge
    if (platform === 'all' || platform === 'curseforge') {
        try {
            logDebug('Starting CurseForge search...');
            const limit = platform === 'curseforge' ? 25 : 15;
            const CF_API_KEY = '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm';
            const filterParam = query ? `&searchFilter=${encodeURIComponent(query)}` : '';
            const url = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=4471&sortField=6&sortOrder=desc&pageSize=${limit}${filterParam}`;
            logDebug(`CurseForge URL: ${url}`);
            const resData = await httpsGetWithHeaders(url, { 'x-api-key': CF_API_KEY });
            logDebug(`CurseForge response length: ${resData.length}`);
            const searchResult = JSON.parse(resData);
            logDebug(`CurseForge data count: ${searchResult.data ? searchResult.data.length : 0}`);
            if (searchResult.data) {
                searchResult.data.forEach(h => {
                    const cfVersions = h.latestFilesIndexes 
                        ? [...new Set(h.latestFilesIndexes.map(x => x.gameVersion))] 
                        : [];
                    results.push({
                        source: 'curseforge',
                        projectId: String(h.id),
                        title: h.name,
                        description: h.summary,
                        iconUrl: h.logo ? h.logo.thumbnailUrl : '',
                        screenshotUrl: h.logo ? h.logo.url : '',
                        categories: ['curseforge'],
                        versions: cfVersions
                    });
                });
            }
        } catch (err) {
            logDebug(`⚠️ CurseForge error: ${err.message}`);
            sendLog(`⚠️ Error buscando en CurseForge: ${err.message}`);
        }
    }

    logDebug(`Total results returned: ${results.length}`);
    return results;
});

ipcMain.handle('install-modpack-from-search', async (event, { projectId, title, iconUrl, screenshotUrl, description, source }) => {
    if (source === 'curseforge') {
        return await installCurseForgeModpack(projectId, title, iconUrl, screenshotUrl, description);
    }

    // Default: Modrinth
    currentOperation = { type: 'install-modpack', cancelled: false };
    try {
        sendLog(`📥 Obteniendo información de "${title}"...`);
        sendProgress(5, 'Obteniendo versiones...');

        const versionUrl = `https://api.modrinth.com/v2/project/${projectId}/version`;
        const versionsData = JSON.parse(await httpsGet(versionUrl));
        
        if (!versionsData || versionsData.length === 0) {
            throw new Error('No se encontraron versiones para este modpack.');
        }

        const latestVersion = versionsData[0];
        const mrpackFile = latestVersion.files.find(f => f.filename.endsWith('.mrpack') || f.primary);
        if (!mrpackFile) {
            throw new Error('No se encontró archivo de modpack (.mrpack) en la última versión.');
        }

        const downloadUrl = mrpackFile.url;
        const tempDir = path.join(BASE_DATA_DIR, 'temp');
        const tempMrpackPath = path.join(tempDir, `modpack-${projectId}.mrpack`);

        sendLog(`📥 Descargando archivo del modpack: ${mrpackFile.filename}...`);
        sendProgress(10, 'Descargando modpack...');
        await downloadFile(downloadUrl, tempMrpackPath, p => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            sendProgress(10 + Math.floor(p * 0.15), `Descargando modpack: ${p}%`);
        });

        sendLog(`📦 Instalando modpack...`);
        sendProgress(25, 'Extrayendo archivos...');

        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        
        const cleanName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
        const instancePath = path.join(mcPath, 'instances', cleanName);
        fs.mkdirSync(instancePath, { recursive: true });

        const zip = new AdmZip(tempMrpackPath);
        zip.extractAllTo(instancePath, true);

        const modrinthIndexJsonPath = path.join(instancePath, 'modrinth.index.json');
        if (!fs.existsSync(modrinthIndexJsonPath)) {
            throw new Error('No se encontró el manifest de Modrinth dentro del modpack.');
        }

        const manifest = JSON.parse(fs.readFileSync(modrinthIndexJsonPath, 'utf8'));
        const mcVersion = manifest.dependencies?.minecraft;
        const neoforgeVersion = manifest.dependencies?.neoforge;
        const forgeVersion = manifest.dependencies?.forge;
        const fabricVersion = manifest.dependencies?.['fabric-loader'] || manifest.dependencies?.fabric;

        sendLog(`Minecraft: ${mcVersion}, Loader: ${fabricVersion ? 'Fabric ' + fabricVersion : (neoforgeVersion ? 'NeoForge ' + neoforgeVersion : (forgeVersion ? 'Forge ' + forgeVersion : 'Vanilla'))}`);

        const modsDir = path.join(instancePath, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });

        let downloaded = 0;
        const totalFiles = manifest.files.length;
        
        for (const file of manifest.files) {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            
            try {
                const targetFilePath = path.join(instancePath, file.path);
                fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });

                await downloadFile(file.downloads[0], targetFilePath, () => { });
                downloaded++;
                sendProgress(40 + Math.floor((downloaded / totalFiles) * 55), `Descargando archivos: ${downloaded}/${totalFiles}`);
            } catch (err) {
                sendLog(`⚠️ Error descargando archivo ${file.path}: ${err.message}`);
            }
        }

        try { fs.unlinkSync(tempMrpackPath); } catch {}

        const metadata = {
            name: title,
            mcVersion,
            loader: fabricVersion ? 'fabric' : (neoforgeVersion ? 'neoforge' : (forgeVersion ? 'forge' : 'vanilla')),
            loaderVersion: fabricVersion || neoforgeVersion || forgeVersion || '',
            iconUrl,
            screenshotUrl,
            description
        };
        fs.writeFileSync(path.join(instancePath, 'instance.json'), JSON.stringify(metadata, null, 2));

        sendLog(`✅ Modpack "${title}" instalado correctamente.`);
        sendProgress(100, 'Instalación completada ✓');
        currentOperation = null;
        return { success: true, name: title };

    } catch (err) {
        sendLog(`❌ Error instalando modpack: ${err.message}`, 'error');
        sendProgress(0, '');
        currentOperation = null;
        return { success: false, error: err.message };
    }
});

// ── VERSIONES INSTALADAS (IPC handlers para listas en UI) ────────────
ipcMain.handle('get-installed-forge-versions', () => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    if (!fs.existsSync(versionsDir)) return [];
    try {
        return fs.readdirSync(versionsDir)
            .filter(d => d.toLowerCase().includes('forge') && !d.toLowerCase().includes('neoforge') && fs.existsSync(path.join(versionsDir, d, `${d}.json`)))
            .map(d => {
                const jsonPath = path.join(versionsDir, d, `${d}.json`);
                let mcVersion = '';
                let forgeVersion = '';
                try {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    mcVersion = data.inheritsFrom || '';
                    forgeVersion = d.replace(new RegExp(`^${mcVersion}-forge-`, 'i'), '');
                } catch {
                    const match = d.match(/^([\d.]+)-.*?([\d.]+)$/);
                    mcVersion = match ? match[1] : d;
                    forgeVersion = match ? match[2] : d;
                }
                return { id: d, mcVersion, forgeVersion };
            });
    } catch { return []; }
});

ipcMain.handle('get-installed-neoforge-versions', () => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    if (!fs.existsSync(versionsDir)) return [];
    try {
        return fs.readdirSync(versionsDir)
            .filter(d => d.toLowerCase().includes('neoforge') && fs.existsSync(path.join(versionsDir, d, `${d}.json`)))
            .map(d => {
                const jsonPath = path.join(versionsDir, d, `${d}.json`);
                let mcVersion = '';
                let neoforgeVersion = '';
                try {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    mcVersion = data.inheritsFrom || '';
                    neoforgeVersion = d.replace(/neoforge-/i, '');
                } catch {
                    const match = d.match(/^([\d.]+)-neoforge-([\d.]+)$/i);
                    mcVersion = match ? match[1] : d;
                    neoforgeVersion = match ? match[2] : d;
                }
                return { id: d, mcVersion, neoforgeVersion };
            });
    } catch { return []; }
});

ipcMain.handle('get-installed-fabric-versions', () => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionsDir = path.join(mcPath, 'versions');
    if (!fs.existsSync(versionsDir)) return [];
    try {
        return fs.readdirSync(versionsDir)
            .filter(d => d.toLowerCase().includes('fabric') && fs.existsSync(path.join(versionsDir, d, `${d}.json`)))
            .map(d => {
                const jsonPath = path.join(versionsDir, d, `${d}.json`);
                let mcVersion = '';
                let loaderVersion = '';
                try {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    mcVersion = data.inheritsFrom || '';
                    const match = d.match(/fabric-loader-([\d.]+)/);
                    loaderVersion = match ? match[1] : '';
                } catch {
                    const match = d.match(/fabric-loader-([\d.]+)-([\d.]+)/);
                    loaderVersion = match ? match[1] : '';
                    mcVersion = match ? match[2] : d;
                }
                return { id: d, loaderVersion, mcVersion };
            });
    } catch { return []; }
});

ipcMain.handle('delete-version', async (event, versionId) => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const versionDir = path.join(mcPath, 'versions', versionId);
    if (!fs.existsSync(versionDir)) {
        return { success: false, error: 'La versión no existe.' };
    }
    try {
        fs.rmSync(versionDir, { recursive: true, force: true });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ── MODS MANAGEMENT ───────────────────────────────────────────────
ipcMain.handle('get-mods', async (event, versionId) => {
    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');

        // Cada loader tiene su propia instancia → sus propios mods
        const instanceDir = versionId ? getInstanceDir(mcPath, versionId) : mcPath;
        const modsDir = path.join(instanceDir, 'mods');

        if (!fs.existsSync(modsDir)) return [];

        const mods = [];
        for (const file of fs.readdirSync(modsDir)) {
            if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {
                const filePath = path.join(modsDir, file);
                const stats = fs.statSync(filePath);
                mods.push({
                    name: file.replace('.disabled', ''),
                    path: filePath,
                    size: stats.size,
                    enabled: !file.endsWith('.disabled'),
                    addedDate: stats.mtime
                });
            }
        }
        return mods.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
        sendLog(`❌ Error listando mods: ${err.message}`, 'error');
        return [];
    }
});

ipcMain.handle('install-mod', async (event, { file, versionId }) => {
    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
        const instanceDir = versionId ? getInstanceDir(mcPath, versionId) : mcPath;
        const modsDir = path.join(instanceDir, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });
        const fileName = path.basename(file);
        const destPath = path.join(modsDir, fileName);
        fs.copyFileSync(file, destPath);
        sendLog(`✅ Mod instalado en ${path.basename(instanceDir)}: ${fileName}`);
        return { success: true, name: fileName };
    } catch (err) {
        sendLog(`❌ Error instalando mod: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
});

ipcMain.handle('toggle-mod', async (event, modPath) => {
    try {
        if (modPath.endsWith('.disabled')) {
            const newPath = modPath.replace('.disabled', '');
            fs.renameSync(modPath, newPath);
            sendLog(`✅ Mod habilitado: ${path.basename(newPath)}`);
            return { success: true, enabled: true };
        } else {
            const newPath = modPath + '.disabled';
            fs.renameSync(modPath, newPath);
            sendLog(`⏸️ Mod deshabilitado: ${path.basename(modPath)}`);
            return { success: true, enabled: false };
        }
    } catch (err) {
        sendLog(`❌ Error toggling mod: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-mod', async (event, modPath) => {
    try {
        fs.unlinkSync(modPath);
        sendLog(`🗑️ Mod eliminado: ${path.basename(modPath)}`);
        return { success: true };
    } catch (err) {
        sendLog(`❌ Error eliminando mod: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
});

// ── MODRINTH SEARCH & INSTALL ─────────────────────────────────────
ipcMain.handle('search-modrinth', async (event, { query, mcVersion, loader }) => {
    try {
        // Construir facets dinámicamente según los filtros disponibles
        const facets = [];
        facets.push('["project_type:mod"]');
        if (mcVersion) facets.push(`["versions:${mcVersion}"]`);
        if (loader) facets.push(`["categories:${loader}"]`);

        const facetsStr = `[${facets.join(',')}]`;
        const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=${encodeURIComponent(facetsStr)}&limit=12`;
        const data = JSON.parse(await httpsGet(url));
        return { success: true, hits: data.hits || [] };
    } catch (err) {
        sendLog(`❌ Error buscando en Modrinth: ${err.message}`, 'error');
        return { success: false, error: err.message, hits: [] };
    }
});

ipcMain.handle('install-mod-from-modrinth', async (event, { projectId, mcVersion, loader, versionId }) => {
    try {
        const s = loadSettings();
        const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');

        // Usar el directorio de instancia correcto según el loader
        const instanceDir = versionId ? getInstanceDir(mcPath, versionId) : mcPath;
        const modsDir = path.join(instanceDir, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });

        const loaderParam = loader === 'forge' ? 'forge' : 'fabric';

        // Buscar versión compatible del mod (con fallback a sin filtro de loader)
        let versionsData = null;
        if (mcVersion && loader) {
            const url1 = `https://api.modrinth.com/v2/project/${projectId}/version?game_versions=["${mcVersion}"]&loaders=["${loaderParam}"]`;
            versionsData = JSON.parse(await httpsGet(url1));
        }
        if (!versionsData || versionsData.length === 0) {
            const url2 = mcVersion
                ? `https://api.modrinth.com/v2/project/${projectId}/version?game_versions=["${mcVersion}"]`
                : `https://api.modrinth.com/v2/project/${projectId}/version`;
            versionsData = JSON.parse(await httpsGet(url2));
        }

        if (!versionsData || versionsData.length === 0) {
            return { success: false, error: `No hay versión de este mod compatible con Minecraft ${mcVersion || '?'} + ${loaderParam}` };
        }

        const latestVer = versionsData[0];
        const primaryFile = latestVer.files.find(f => f.primary) || latestVer.files[0];
        if (!primaryFile) return { success: false, error: 'No se encontró archivo descargable' };

        const destPath = path.join(modsDir, primaryFile.filename);
        if (fs.existsSync(destPath)) {
            return { success: true, modName: primaryFile.filename, note: 'Ya estaba instalado' };
        }

        sendLog(`📥 Descargando ${primaryFile.filename} → ${path.basename(instanceDir)}/mods/`);
        await downloadFile(primaryFile.url, destPath, () => { });
        sendLog(`✅ Mod instalado: ${primaryFile.filename}`);

        return { success: true, modName: primaryFile.filename };
    } catch (err) {
        sendLog(`❌ Error instalando mod: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
});

// ── ABORT OPERATION ───────────────────────────────────────────────
ipcMain.handle('abort-operation', () => {
    // ─ Caso 1: operación en curso (descarga/instalación/preparación de lanzamiento)
    if (currentOperation) {
        try {
            currentOperation.cancelled = true;
            // Matar proceso hijo (OptiFine installer, Java download, etc.)
            if (currentOperation.proc && !currentOperation.proc.killed) {
                currentOperation.proc.kill('SIGKILL');
            }
            // Abortar descarga HTTP activa
            if (currentOperation.request) {
                try { currentOperation.request.destroy(); } catch { }
            }
            sendLog(`⛔ Cancelado: ${currentOperation.type}`, 'warn');
            sendProgress(0, '');
            setTimeout(() => { currentOperation = null; }, 2000);
            return { success: true, message: 'Operación cancelada' };
        } catch (err) {
            sendLog(`❌ Error cancelando: ${err.message}`, 'error');
            currentOperation = null;
            return { success: false, error: err.message };
        }
    }

    // ─ Caso 2: matar la última instancia de juego corriendo
    if (runningInstances.size > 0) {
        const lastId = Math.max(...runningInstances.keys());
        const inst = runningInstances.get(lastId);
        if (inst) {
            try {
                const proc = inst.launcher?.proc;
                if (proc && !proc.killed) {
                    proc.kill('SIGKILL');
                    sendLog(`⏹ Instancia #${lastId} detenida por usuario`, 'warn');
                    return { success: true, message: `Instancia #${lastId} detenida` };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
    }

    return { success: false, message: 'No hay operación activa' };
});

// ── Matar instancia específica por ID ────────────────────────────
ipcMain.handle('kill-instance', (e, instanceId) => {
    const inst = runningInstances.get(instanceId);
    if (!inst) return { success: false, error: 'Instancia no encontrada' };
    try {
        const proc = inst.launcher?.proc;
        if (proc && !proc.killed) proc.kill('SIGKILL');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ── Listar instancias corriendo ───────────────────────────────────
ipcMain.handle('get-running-instances', () =>
    Array.from(runningInstances.entries()).map(([id, inst]) => ({ id, version: inst.version }))
);


// ── Window Controls ───────────────────────────────────────────────
ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.on('window-maximize', () => win?.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('window-close', () => win?.close());
ipcMain.on('open-url', (e, url) => shell.openExternal(url));
ipcMain.on('open-client-url', (e, url) => shell.openExternal(url));
ipcMain.handle('pick-java', async () => {
    const result = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'Java', extensions: ['exe'] }] });
    return result.filePaths[0] || '';
});
ipcMain.handle('pick-gamedir', async () => {
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    return result.filePaths[0] || '';
});

// ── Screenshots ───────────────────────────────────────────────────
ipcMain.handle('get-screenshots', () => {
    const s = loadSettings();
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');
    const ssDir = path.join(mcPath, 'screenshots');
    if (!fs.existsSync(ssDir)) return [];
    const files = fs.readdirSync(ssDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    return files.map(f => ({ name: f, path: path.join(ssDir, f) })).sort((a, b) => {
        const aTime = fs.statSync(a.path).mtime.getTime();
        const bTime = fs.statSync(b.path).mtime.getTime();
        return bTime - aTime;
    }).slice(0, 50);
});

// ── PVP Clients ───────────────────────────────────────────────────
const PVP_CLIENTS = [
    { id: 'labymod', name: 'LabyMod', icon: '🔶', color: '#f97316', desc: 'El cliente más popular. HUD modular, emotes, cloaks y cientos de addons oficiales.', url: 'https://laby.net/#download' },
    { id: 'lunar', name: 'Lunar Client', icon: '🌙', color: '#818cf8', desc: 'Boost de FPS masivo. Waypoints, cosmetics y +100 mods integrados. Compatible 1.7 → 1.21.', url: 'https://lunarclient.com/download' },
    { id: 'badlion', name: 'Badlion', icon: '🛡️', color: '#ef4444', desc: 'Anti-cheat integrado, ideal para PVP competitivo. Soporte oficial para torneos.', url: 'https://client.badlion.net/' },
    { id: 'feather', name: 'Feather', icon: '🪶', color: '#22c55e', desc: 'El más ligero y moderno. Diseño renovado, mods optimizados y gestión de perfiles fácil.', url: 'https://feathermc.gg/download' },
    { id: 'pvplounge', name: 'PVP Lounge', icon: '⚔️', color: '#a855f7', desc: 'Cliente europeo con integración de torneos, ligas y rankings de la comunidad competitiva.', url: 'https://pvplounge.net/download' },
    { id: 'salwyrr', name: 'Salwyrr', icon: '💎', color: '#06b6d4', desc: 'Excelente para servidores hispanohablantes. Optimización brutal para PCs de gama baja.', url: 'https://www.salwyrr.com/download' }
];

ipcMain.handle('get-pvp-clients', () => PVP_CLIENTS);

// ── Microsoft Auth ────────────────────────────────────────────────
async function doMicrosoftAuth() {
    const CLIENT_ID = '00000000402b5328';
    const REDIRECT = 'https://login.live.com/oauth20_desktop.srf';
    const authUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${CLIENT_ID}&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=${encodeURIComponent(REDIRECT)}`;

    const code = await new Promise((resolve, reject) => {
        const aw = new BrowserWindow({ width: 520, height: 680, title: 'Microsoft Login', webPreferences: { nodeIntegration: false, contextIsolation: true } });
        aw.loadURL(authUrl);
        const check = (_, url) => {
            if (url.includes('code=')) { const m = url.match(/code=([^&]+)/); if (m) { aw.close(); resolve(decodeURIComponent(m[1])); } }
            else if (url.includes('error=')) { aw.close(); reject(new Error('Auth cancelada')); }
        };
        aw.webContents.on('will-redirect', check);
        aw.webContents.on('will-navigate', check);
        aw.on('closed', () => reject(new Error('Ventana cerrada')));
    });

    sendLog('Obteniendo tokens de acceso…');
    const tokenRes = await new Promise((resolve, reject) => {
        const body = `client_id=${CLIENT_ID}&code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(REDIRECT)}`;
        const req = https.request({ hostname: 'login.live.com', path: '/oauth20_token.srf', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
            (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
        req.on('error', reject); req.write(body); req.end();
    });

    sendLog('Autenticando con Xbox Live…');
    const xblData = JSON.parse((await httpsPost('https://user.auth.xboxlive.com/user/authenticate', { Properties: { AuthMethod: 'RPS', SiteName: 'user.auth.xboxlive.com', RpsTicket: `d=${tokenRes.access_token}` }, RelyingParty: 'http://auth.xboxlive.com', TokenType: 'JWT' })).data);

    sendLog('Validando XSTS…');
    const xstsData = JSON.parse((await httpsPost('https://xsts.auth.xboxlive.com/xsts/authorize', { Properties: { SandboxId: 'RETAIL', UserTokens: [xblData.Token] }, RelyingParty: 'rp://api.minecraftservices.com/', TokenType: 'JWT' })).data);
    if (xstsData.XErr) throw new Error({ 2148916238: 'Sin Xbox Live. Ve a xbox.com.', 2148916235: 'Xbox no disponible en tu región.' }[xstsData.XErr] ?? `Xbox error ${xstsData.XErr}`);

    sendLog('Obteniendo acceso a Minecraft…');
    const mcData = JSON.parse((await httpsPost('https://api.minecraftservices.com/authentication/login_with_xbox', { identityToken: `XBL3.0 x=${xblData.DisplayClaims.xui[0].uhs};${xstsData.Token}` })).data);
    if (!mcData.access_token) throw new Error('Sin token de Minecraft');

    sendLog('Cargando perfil…');
    const profileStr = await new Promise((resolve, reject) => {
        https.get({ hostname: 'api.minecraftservices.com', path: '/minecraft/profile', headers: { Authorization: `Bearer ${mcData.access_token}` } },
            (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); }).on('error', reject);
    });
    const profile = JSON.parse(profileStr);
    if (profile.error) throw new Error('Esta cuenta no tiene Minecraft comprado.');
    return { name: profile.name, uuid: profile.id, accessToken: mcData.access_token, userType: 'msa' };
}

ipcMain.on('microsoft-login', async (event) => {
    try {
        sendLog('🔐 Abriendo ventana de Microsoft…');
        const auth = await doMicrosoftAuth();
        sendLog(`✅ ¡Bienvenido, ${auth.name}!`);
        event.reply('microsoft-success', auth);
    } catch (err) {
        sendLog(`❌ Microsoft: ${err.message}`, 'error');
        event.reply('microsoft-error', err.message);
    }
});

// ── Launch Game ─── Multi-instancia ──────────────────────────────
ipcMain.on('launch-game', async (event, data) => {
    const s = loadSettings();
    const multiInst = s.multiInstance ?? false;
    const MAX_INST = 3;
    const mcPath = s.gameDir || path.join(BASE_DATA_DIR, '.minecraft');

    // Verificar límite de instancias
    if (!multiInst && runningInstances.size > 0) {
        sendLog('⚠️ El juego ya está corriendo. Activa "Múltiples instancias" en Configuración.', 'error');
        win?.webContents.send('launch-blocked');
        return;
    }
    if (runningInstances.size >= MAX_INST) {
        sendLog(`⚠️ Límite de ${MAX_INST} instancias simultáneas alcanzado.`, 'error');
        win?.webContents.send('launch-blocked');
        return;
    }

    const instanceId = ++instanceCounter;
    const launcher = new Client();

    // Registrar currentOperation para que abort funcione durante preparación
    currentOperation = { type: 'launch', instanceId, cancelled: false };
    win?.webContents.send('instance-launching', { instanceId });

    try {
        ensureLauncherProfiles(mcPath);
        cleanCorruptedLibs(mcPath);

        let launchVersion = data.version;
        let launchModId = data.modId;
        let modpackDispName = '';

        // Si se lanza un modpack, resolver su loader e instalarlo si es necesario
        if (data.modpackName) {
            sendLog(`📦 Cargando perfil del modpack: ${data.modpackName}...`);
            const instanceJsonPath = path.join(mcPath, 'instances', data.modpackName, 'instance.json');
            if (!fs.existsSync(instanceJsonPath)) {
                throw new Error('No se encontró el archivo instance.json del modpack.');
            }
            const meta = JSON.parse(fs.readFileSync(instanceJsonPath, 'utf8'));
            modpackDispName = meta.name || data.modpackName;
            const mcVer = meta.mcVersion;
            const loader = meta.loader;
            const loaderVer = meta.loaderVersion;

            launchVersion = mcVer;

            if (loader === 'fabric') {
                const fabricVersionId = `fabric-loader-${loaderVer}-${mcVer}`;
                const fabricDir = path.join(mcPath, 'versions', fabricVersionId);
                if (!fs.existsSync(path.join(fabricDir, `${fabricVersionId}.json`))) {
                    sendLog(`🔧 Instalador: Descargando Fabric Loader ${loaderVer}...`);
                    await ensureFabricLoader(mcVer, loaderVer);
                }
                launchModId = fabricVersionId;
            } else if (loader === 'neoforge') {
                const versionsDir = path.join(mcPath, 'versions');
                let installedNeoForgeVer = null;
                if (fs.existsSync(versionsDir)) {
                    const dirs = fs.readdirSync(versionsDir);
                    installedNeoForgeVer = dirs.find(d => {
                        const dl = d.toLowerCase();
                        return dl.includes('neoforge') && dl.includes(loaderVer.toLowerCase()) && fs.existsSync(path.join(versionsDir, d, `${d}.json`)) && (() => { try { return JSON.parse(fs.readFileSync(path.join(versionsDir, d, `${d}.json`), 'utf8')).inheritsFrom; } catch { return false; } })();
                    });
                }
                if (!installedNeoForgeVer) {
                    sendLog(`🔧 Instalador: Descargando NeoForge ${loaderVer}...`);
                    installedNeoForgeVer = await ensureNeoForgeLoader(mcVer, loaderVer);
                }
                launchModId = installedNeoForgeVer;
            } else if (loader === 'forge') {
                const versionsDir = path.join(mcPath, 'versions');
                let installedForgeVer = null;
                if (fs.existsSync(versionsDir)) {
                    const dirs = fs.readdirSync(versionsDir);
                    installedForgeVer = dirs.find(d => {
                        const dl = d.toLowerCase();
                        return dl.includes('forge') && dl.includes(loaderVer) && dl.includes(mcVer) && fs.existsSync(path.join(versionsDir, d, `${d}.json`));
                    });
                }
                if (!installedForgeVer) {
                    sendLog(`🔧 Instalador: Descargando Forge ${loaderVer}...`);
                    installedForgeVer = await ensureForgeLoader(mcVer, loaderVer);
                }
                launchModId = installedForgeVer;
            } else {
                launchModId = mcVer;
            }
        }

        const displayVersion = launchModId || launchVersion;
        sendLog(`🚀 Preparando ${displayVersion}…`);
        sendProgress(0, 'Preparando…');

        const javaExe = await ensureJava(launchVersion, s.javaPath);

        // Verificar cancelación tras descarga de Java
        if (currentOperation?.cancelled) {
            sendLog('⛔ Lanzamiento cancelado.', 'warn');
            currentOperation = null;
            win?.webContents.send('instance-cancelled', { instanceId });
            return;
        }

        let auth;
        if (data.type === 'microsoft' && data.auth) {
            auth = { access_token: data.auth.accessToken, client_token: crypto.randomUUID(), uuid: data.auth.uuid, name: data.auth.name, user_properties: '{}' };
        } else {
            auth = Authenticator.getAuth(data.username);
        }

        let versionOpts;
        if (launchModId && launchModId !== launchVersion) {
            versionOpts = { number: launchVersion, type: data.versionType || 'release', custom: launchModId };
            sendLog(`🔧 Modo mod: MC ${launchVersion} + custom: ${launchModId}`);
        } else {
            versionOpts = { number: launchVersion, type: data.versionType || 'release' };
        }

        // Directorio de instancia separado
        const instanceDir = data.modpackName
            ? path.join(mcPath, 'instances', data.modpackName)
            : (launchModId && launchModId !== launchVersion ? getInstanceDir(mcPath, launchModId) : mcPath);

        if (instanceDir !== mcPath) {
            fs.mkdirSync(path.join(instanceDir, 'mods'), { recursive: true });
            ensureLauncherProfiles(instanceDir);
            sendLog(`📂 Instancia: ${path.basename(instanceDir)}`);
        }

        const opts = {
            authorization: auth, root: mcPath, javaPath: javaExe,
            version: versionOpts,
            memory: { max: `${data.ram}G`, min: '512M' },
            ...(instanceDir !== mcPath ? { overrides: { gameDirectory: instanceDir } } : {})
        };

        let activeJvmArgs = '';
        if (data.modpackName === 'Fussionborn') {
            activeJvmArgs = s.fussionbornJvmArgs !== undefined ? s.fussionbornJvmArgs : '';
        } else {
            activeJvmArgs = s.jvmArgs || '';
        }
        if (activeJvmArgs && activeJvmArgs.trim()) {
            opts.customArgs = activeJvmArgs.trim().split(/\s+/);
        }

        launcher.on('progress', e => {
            const p = Math.floor((e.task / e.total) * 100);
            sendProgress(p, `${e.type}: ${e.task}/${e.total}`);
        });
        launcher.on('debug', e => { const s = String(e); if (s.length < 300) sendLog(s); });
        launcher.on('data', e => sendLog(String(e)));
        launcher.on('close', code => {
            runningInstances.delete(instanceId);
            const count = runningInstances.size;
            sendLog(`✅ Instancia #${instanceId} cerrada (código: ${code}).`);
            win?.webContents.send('instances-update', { count, closedId: instanceId });
            if (count === 0) {
                sendProgress(0, '');
                setRPCLauncher();
            }
        });

        // Limpiar currentOperation ANTES de lanzar
        currentOperation = null;

        // Inject NeoForge/Forge JVM args from version JSON into opts.customArgs
        // MCLC v3.18.2 getJVM() only returns one OS flag, doesn't read arguments.jvm
        // But opts.customArgs ARE appended to JVM args (launcher.js line ~85)
        if (launchModId && (launchModId.toLowerCase().includes('neoforge') || launchModId.toLowerCase().includes('forge'))) {
            try {
                const vJsonPath = path.join(mcPath, 'versions', launchModId, `${launchModId}.json`);
                if (fs.existsSync(vJsonPath)) {
                    const vJson = JSON.parse(fs.readFileSync(vJsonPath, 'utf8'));
                    
                    // Initialize opts.customArgs if undefined
                    if (!opts.customArgs) opts.customArgs = [];
                    
                    // Direct approach: collect ALL JVM args from version JSON (main + inherited)
                    const collectJvmArgs = (jvmArr) => {
                        if (!jvmArr || !Array.isArray(jvmArr)) return;
                        for (const arg of jvmArr) {
                            if (typeof arg === 'string') {
                                // Resolve placeholders for Forge compatibility (NeoForge uses absolute paths)
                                let resolved = arg;
                                resolved = resolved.replace(/$\{library_directory\}/g, path.join(mcPath, 'libraries'));
                                resolved = resolved.replace(/$\{classpath_separator\}/g, ';');
                                if (resolved.startsWith('--add-') || resolved === '-p' || resolved === '--module-path' || !opts.customArgs.includes(resolved)) {
                                    opts.customArgs.push(resolved);
                                }
                            } else if (arg && typeof arg === 'object' && Array.isArray(arg.value)) {
                                let allowed = true;
                                if (arg.rules) {
                                    for (const rule of arg.rules) {
                                        if (rule.action === 'disallow' && rule.os && rule.os.name === 'windows') {
                                            allowed = false;
                                        }
                                    }
                                }
                                if (allowed) {
                                    for (const v of arg.value) {
                                        if (typeof v === 'string') {
                                            if (v.startsWith('--add-') || v === '-p' || v === '--module-path' || !opts.customArgs.includes(v)) {
                                                opts.customArgs.push(v);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    
                    collectJvmArgs(vJson.arguments?.jvm);
                    if (vJson.inheritsFrom) {
                        const basePath = path.join(mcPath, 'versions', vJson.inheritsFrom, `${vJson.inheritsFrom}.json`);
                        if (fs.existsSync(basePath)) {
                            const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
                            collectJvmArgs(base.arguments?.jvm);
                        }
                    }
                    
                    // Also ensure critical JVM args in version JSON on disk + opts.customArgs (safety layer)
                    if (ensureCriticalNeoForgeJvmArgs(vJsonPath)) {
                        sendLog('📝 JVM args críticos inyectados en version JSON (--add-opens, --add-modules, etc.)');
                    }
                    // Also ensure critical args are in opts.customArgs (MCLC reads from there)
                    const criticalArgsForMCLC = NEOFORGE_CRITICAL_JVM_ARGS;
                    for (const arg of criticalArgsForMCLC) {
                        if (!opts.customArgs.includes(arg)) {
                            opts.customArgs.push(arg);
                        }
                    }
                    
                    sendLog(`🔧 Custom JVM Arguments (${opts.customArgs.length} args): ${opts.customArgs.join(' ')}`);
                }
            } catch (e) {
                sendLog(`⚠️ No se pudieron inyectar JVM args de ${launchModId}: ${e.message}`, 'warn');
            }
        }

        launcher.launch(opts);

        // Registrar instancia activa
        const instanceDisplayName = data.modpackName ? modpackDispName : `Minecraft ${launchVersion}${launchModId && launchModId !== launchVersion ? ` (${launchModId})` : ''}`;
        runningInstances.set(instanceId, { launcher, version: launchVersion, displayName: instanceDisplayName });
        win?.webContents.send('instances-update', { count: runningInstances.size, newId: instanceId, displayName: instanceDisplayName });

        // Discord RPC
        const modType = launchModId
            ? (launchModId.toLowerCase().includes('optifine') ? 'optifine'
                : launchModId.toLowerCase().includes('neoforge') ? 'neoforge'
                    : launchModId.toLowerCase().includes('forge') ? 'forge'
                        : launchModId.toLowerCase().includes('fabric') ? 'fabric'
                            : null)
            : null;
        setRPCPlaying(launchVersion, modType, data.modpackName ? modpackDispName : null);

        sendLog(`✅ ${displayVersion} iniciado. ¡Que te diviertas!`);
        sendProgress(100, '🎮 En juego');

    } catch (err) {
        runningInstances.delete(instanceId);
        if (currentOperation?.instanceId === instanceId) currentOperation = null;
        sendLog(`❌ Error al iniciar: ${err.message}`, 'error');
        sendProgress(0, '');
        win?.webContents.send('instances-update', { count: runningInstances.size, errorId: instanceId });
    }
});

// ── Auto-Updater ──────────────────────────────────────────────────
ipcMain.handle('check-for-updates', async () => {
    const s = loadSettings();
    const url = s.updateUrl;
    if (!url) return { updateAvailable: false };
    
    return new Promise((resolve) => {
        const https = require('https');
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const localVer = require('./package.json').version;
                    
                    const compareVersions = (v1, v2) => {
                        const p1 = v1.split('.').map(Number);
                        const p2 = v2.split('.').map(Number);
                        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
                            const n1 = p1[i] || 0;
                            const n2 = p2[i] || 0;
                            if (n1 > n2) return 1;
                            if (n2 > n1) return -1;
                        }
                        return 0;
                    };
                    
                    if (compareVersions(data.version, localVer) > 0) {
                        resolve({ updateAvailable: true, version: data.version, notes: data.notes, url: data.platforms?.['windows-x64']?.url || data.url });
                    } else {
                        resolve({ updateAvailable: false });
                    }
                } catch (err) {
                    resolve({ updateAvailable: false, error: err.message });
                }
            });
        }).on('error', err => {
            resolve({ updateAvailable: false, error: err.message });
        });
    });
});

ipcMain.on('download-update', (event, { url }) => {
    const https = require('https');
    const fs = require('fs');
    
    const isPackaged = app.isPackaged;
    const dest = path.join(resourcesDir, 'app.asar.update');
    
    let file = null;

    function download(downloadUrl) {
        https.get(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, response => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    download(redirectUrl);
                    return;
                }
            }

            if (response.statusCode !== 200) {
                event.reply('update-download-error', `HTTP Error ${response.statusCode}`);
                return;
            }

            file = fs.createWriteStream(dest);
            const total = parseInt(response.headers['content-length'] || '0', 10);
            let downloaded = 0;
            
            response.pipe(file);
            
            response.on('data', chunk => {
                downloaded += chunk.length;
                if (total > 0) {
                    const percent = Math.round((downloaded / total) * 100);
                    event.reply('update-download-progress', { percent });
                }
            });
            
            let swapApplied = false;
            function applyHotSwap() {
                if (swapApplied) return;
                swapApplied = true;
                try {
                    const updateAsar = path.join(resourcesDir, 'app.asar.update');
                    if (!fs.existsSync(updateAsar)) {
                        event.reply('update-download-error', 'Archivo de actualización no encontrado.');
                        return;
                    }
                    // app.asar is locked — we just signal success; the actual swap
                    // happens via bat script when the user clicks "Reiniciar Launcher"
                    event.reply('update-download-success');
                } catch (err) {
                    console.error('[Updater] Hot-swap update error:', err);
                    event.reply('update-download-error', 'Error al aplicar la actualización: ' + err.message);
                }
            }

            file.on('finish', () => {
                if (file) {
                    file.close();
                } else {
                    applyHotSwap();
                }
            });

            file.on('close', () => {
                applyHotSwap();
            });

            file.on('error', err => {
                if (file) file.close();
                fs.unlink(dest, () => {});
                event.reply('update-download-error', err.message);
            });
        }).on('error', err => {
            if (file) {
                file.close();
                fs.unlink(dest, () => {});
            }
            event.reply('update-download-error', err.message);
        });
    }

    download(url);
});

ipcMain.on('apply-update', () => {
    const exePath = process.execPath;
    const updateAsar = path.join(resourcesDir, 'app.asar.update');
    const currentAsar = path.join(resourcesDir, 'app.asar');
    const currentAppDir = path.join(resourcesDir, 'app');
    const batPath = path.join(resourcesDir, 'apply_update.bat');

    const batContent = [
        '@echo off',
        'taskkill /f /im "Nebula Launcher.exe" 2>nul',
        'set /a count=0',
        'ping -n 3 127.0.0.1 >nul',
        ':retry',
        'set /a count+=1',
        'if %count% gtr 10 goto launch',
        `if exist "${currentAsar}" (`,
        `  del /f /q "${currentAsar}" 2>nul`,
        `  if exist "${currentAsar}" (`,
        `    ping -n 2 127.0.0.1 >nul`,
        `    goto retry`,
        `  )`,
        `)`,
        `if exist "${currentAppDir}" (`,
        `  rd /s /q "${currentAppDir}" 2>nul`,
        `)`,
        `if exist "${updateAsar}" (`,
        `  move /y "${updateAsar}" "${currentAsar}"`,
        `)`,
        ':launch',
        `start "" "${exePath}"`,
        `del "%~f0" 2>nul`,
    ].join('\r\n');

    try {
        fs.writeFileSync(batPath, batContent, 'utf8');
        // Usar spawn con shell: true para manejar comillas y espacios de forma nativa.
        const child = spawn(batPath, [], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
            shell: true
        });
        child.unref();
    } catch (e) {
        console.error('[apply-update] bat error:', e);
    }

    app.quit();
});


