// ============================================================
// FUSSIONBORN - CÓDIGO DE BACKUP
// Extraído del Nebula Launcher el 2026-06-29
// Para reutilizar en el futuro, copiar los bloques correspondientes
// a main.js e index.html
// ============================================================

// ─────────────────────────────────────────────────────────
// SECCIÓN 1: main.js — Configuración de settings (línea 688)
// Agregar dentro del objeto defaultSettings en loadSettings()
// ─────────────────────────────────────────────────────────
/*
fussionbornDownloadUrl: 'https://drive.usercontent.google.com/download?id=1U9PgwXMPTZT-xNoQzKjP8EtXdY7lSGuB&export=download&confirm=t',
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 2: main.js — Migración de URL (líneas 714-719)
// Agregar dentro de loadSettings(), después del bucle de campos predeterminados
// ─────────────────────────────────────────────────────────
/*
// Migración: Actualizar URL antigua de Fussionborn (R2) a Google Drive
const oldR2Url = 'https://pub-d38529ebbdbe4598b4d3d552ffc4246f.r2.dev/FUSSIONBORN.zip';
if (data.fussionbornDownloadUrl === oldR2Url) {
    data.fussionbornDownloadUrl = defaultSettings.fussionbornDownloadUrl;
    changed = true;
}
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 3: main.js — IPC Handler install-fussionborn (líneas 2198-2407)
// Handler completo para instalar el modpack Fussionborn
// ─────────────────────────────────────────────────────────
/*
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
        const downloadUrl = s.fussionbornDownloadUrl || 'https://drive.usercontent.google.com/download?id=1U9PgwXMPTZT-xNoQzKjP8EtXdY7lSGuB&export=download&confirm=t';

        sendLog('📥 Descargando Fussionborn modpack desde la nube…');
        sendProgress(10, 'Descargando Fussionborn…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // Timeout de 5 minutos de inactividad para archivos grandes (1.4+ GB desde Google Drive)
        await downloadFile(downloadUrl, tempZipPath, (p, mb, extra) => {
            if (currentOperation.cancelled) throw new Error('Operación cancelada');
            let label = `Descargando Fussionborn: ${p}%`;
            if (extra && extra.remainingTimeStr) {
                label += ` (${extra.speedMBps.toFixed(1)} MB/s, restante: ${extra.remainingTimeStr})`;
            }
            sendProgress(10 + Math.floor(p * 0.7), label);
        }, { socketTimeoutMs: 300000 });

        sendLog('✅ Descarga completada');
        sendProgress(80, 'Instalando Fussionborn…');

        if (currentOperation.cancelled) throw new Error('Operación cancelada');

        // Extract using Expand-Archive -Force
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
            execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript], { timeout: 1800000 });
        }

        try { fs.unlinkSync(tempZipPath); } catch {}

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

        try {
            const xmclJson = path.join(fussionbornDir, 'xmcl.json');
            if (fs.existsSync(xmclJson)) fs.unlinkSync(xmclJson);
        } catch {}

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

        const manifestJsonPath = path.join(fussionbornDir, 'manifest.json');
        const modsDir = path.join(fussionbornDir, 'mods');
        fs.mkdirSync(modsDir, { recursive: true });
        if (fs.existsSync(manifestJsonPath)) {
            try {
                const manifestData = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
                const modFiles = manifestData.files || [];
                if (modFiles.length > 0) {
                    const existingMods = new Set();
                    try { fs.readdirSync(modsDir).forEach(f => existingMods.add(f.toLowerCase())); } catch {}
                    const missingMods = modFiles.filter(f => {
                        const pattern = `mod_${f.fileID}.jar`;
                        return !existingMods.has(pattern.toLowerCase());
                    });
                    if (missingMods.length > 0) {
                        sendLog(`📥 Descargando ${missingMods.length} mods desde CurseForge...`);
                        let downloaded = 0;
                        const startTimeMods = Date.now();
                        for (const modFile of missingMods) {
                            if (currentOperation.cancelled) throw new Error('Operación cancelada');
                            try {
                                const modPath = path.join(modsDir, `mod_${modFile.fileID}.jar`);
                                await downloadCurseForgeMod(modFile.projectID, modFile.fileID, modPath);
                                downloaded++;
                                let etaStr = '';
                                if (downloaded > 2) {
                                    const elapsed = (Date.now() - startTimeMods) / 1000;
                                    const avgTimePerMod = elapsed / downloaded;
                                    const remainingSeconds = Math.round((missingMods.length - downloaded) * avgTimePerMod);
                                    if (remainingSeconds > 60) {
                                        etaStr = `, restante: ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`;
                                    } else {
                                        etaStr = `, restante: ${remainingSeconds}s`;
                                    }
                                }
                                sendProgress(80 + Math.floor((downloaded / missingMods.length) * 15), `Descargando mods: ${downloaded}/${missingMods.length}${etaStr}`);
                            } catch (modErr) {
                                sendLog(`⚠️ Error descargando mod ${modFile.projectID}/${modFile.fileID}: ${modErr.message}`, 'warn');
                            }
                        }
                        sendLog(`✅ ${downloaded}/${missingMods.length} mods descargados correctamente.`);
                        try {
                            const allMods = new Set();
                            for (const mf of modFiles) { allMods.add(`mod_${mf.fileID}.jar`.toLowerCase()); }
                            const afterFiles = fs.readdirSync(modsDir);
                            for (const f of afterFiles) {
                                if (f.endsWith('.jar') && !f.startsWith('mod_')) fs.unlinkSync(path.join(modsDir, f));
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

        const instanceJsonPath = path.join(fussionbornDir, 'instance.json');
        let fbMcVersion = "1.21.1";
        let fbLoader = "neoforge";
        let fbLoaderVersion = "21.1.233";
        if (fs.existsSync(manifestJsonPath)) {
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
                if (manifest.minecraft && manifest.minecraft.version) fbMcVersion = manifest.minecraft.version;
                if (manifest.minecraft && manifest.minecraft.modLoaders) {
                    const primary = manifest.minecraft.modLoaders.find(l => l.primary) || manifest.minecraft.modLoaders[0];
                    if (primary && primary.id) {
                        const parts = primary.id.split('-');
                        if (parts.length >= 2) { fbLoader = parts[0]; fbLoaderVersion = parts.slice(1).join('-'); }
                    }
                }
                sendLog(`📋 Detectado: Minecraft ${fbMcVersion} + ${fbLoader} ${fbLoaderVersion}`);
            } catch (e) {
                sendLog(`⚠️ Usando versión predeterminada (error leyendo manifest): ${e.message}`, 'warn');
            }
        }
        const instanceMeta = {
            name: "Fussionborn",
            mcVersion: fbMcVersion,
            loader: fbLoader,
            loaderVersion: fbLoaderVersion,
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
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 4: main.js — JVM Args especiales (líneas 3470-3471)
// Dentro del handler launch-game, reemplaza:
//   activeJvmArgs = s.jvmArgs || '';
// Por:
// ─────────────────────────────────────────────────────────
/*
let activeJvmArgs = '';
if (data.modpackName === 'Fussionborn') {
    activeJvmArgs = s.fussionbornJvmArgs !== undefined ? s.fussionbornJvmArgs : '';
} else {
    activeJvmArgs = s.jvmArgs || '';
}
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 5: index.html — CSS Fussionborn (líneas 677-793)
// Pegar en el bloque <style> del HTML
// ─────────────────────────────────────────────────────────
/*
.fussionborn-layout {
  display: flex;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(18, 15, 8, 0.45);
  border: 1px solid rgba(234, 179, 8, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  flex: 1;
}
.fussionborn-left {
  flex: 1.2;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: radial-gradient(circle at center, rgba(234, 179, 8, 0.15) 0%, rgba(0, 0, 0, 0) 70%), linear-gradient(135deg, rgba(20, 18, 10, 0.8), rgba(10, 8, 5, 0.9));
  border-right: 1px solid rgba(234, 179, 8, 0.1);
  -webkit-app-region: no-drag;
}
.fussionborn-right {
  flex: 1.8;
  display: flex;
  flex-direction: column;
  padding: 30px;
  overflow-y: auto;
  background: rgba(10, 9, 6, 0.55);
  gap: 20px;
  -webkit-app-region: no-drag;
}
.fussionborn-logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
.fussionborn-gold-glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(234, 179, 8, 0.28) 0%, rgba(234, 179, 8, 0.06) 50%, rgba(0,0,0,0) 75%);
  filter: blur(20px);
  animation: fussionGlow 5s ease-in-out infinite alternate;
}
@keyframes fussionGlow {
  0% { transform: scale(0.92); opacity: 0.85; }
  100% { transform: scale(1.08); opacity: 1; }
}
.fussionborn-logo {
  z-index: 2;
  width: 170px;
  height: 170px;
  object-fit: contain;
  filter: drop-shadow(0 0 25px rgba(234, 179, 8, 0.45));
}
.fussionborn-play-btn {
  margin-top: 30px;
  z-index: 2;
  padding: 13px 40px;
  font-size: 1rem;
  font-weight: 800;
  color: #1c1507;
  background: linear-gradient(135deg, #fef08a, #eab308);
  border: 1px solid #ca8a04;
  border-radius: 26px;
  box-shadow: 0 0 25px rgba(234, 179, 8, 0.4);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.fussionborn-play-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 35px rgba(234, 179, 8, 0.65);
  background: linear-gradient(135deg, #ffffff, #facc15);
}
.fussionborn-play-btn:active:not(:disabled) { transform: translateY(1px); }
.fussionborn-play-btn:disabled {
  background: linear-gradient(135deg, rgba(254, 240, 138, 0.3), rgba(234, 179, 8, 0.3));
  border-color: rgba(202, 138, 4, 0.3);
  color: rgba(28, 21, 7, 0.5);
  box-shadow: none;
  cursor: not-allowed;
}
.fussionborn-title {
  font-size: 2.1rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 20%, #fef08a 65%, #eab308 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 4px 0;
  letter-spacing: 2.5px;
}
.fussionborn-subtitle {
  font-size: 0.8rem;
  color: #ca8a04;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.fussionborn-feature-card {
  background: rgba(234, 179, 8, 0.03);
  border: 0.5px solid rgba(234, 179, 8, 0.1);
  border-radius: 14px;
  padding: 16px;
}
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 6: index.html — Nav button (línea 1516-1519)
// Botón en la barra lateral
// ─────────────────────────────────────────────────────────
/*
<button class="nav-item" onclick="showTab('pvp')" style="border: 0.5px solid rgba(234,179,8,0.15); background: rgba(234,179,8,0.03); margin-top: 4px; margin-bottom: 4px;">
  <span class="nav-icon" style="filter: drop-shadow(0 0 5px rgba(234,179,8,0.5));">👑</span>
  <span style="color:#fef08a; font-weight:700; text-shadow:0 0 10px rgba(234,179,8,0.2);">FUSSIONBORN</span>
</button>
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 7: index.html — Tab panel completo del modpack (líneas 1949-2127)
// El div#tab-pvp completo con toda la UI (logo, botón play, features, galería, settings)
// NOTA: Requiere imágenes fussionborn_logo.png, fussionborn_gameplay1.png, fussionborn_gameplay2.png, fussionborn_creator.png
// ─────────────────────────────────────────────────────────
/*
<div class="tab-panel" id="tab-pvp" style="padding: 52px 0 0 0; overflow:hidden; height:100%; box-sizing:border-box;">
  <div class="fussionborn-layout">
    <!-- Column 1: Logo, Glow, Action Button -->
    <div class="fussionborn-left">
      <div class="fussionborn-gold-glow"></div>
      <div class="fussionborn-logo-container">
        <img src="fussionborn_logo.png" class="fussionborn-logo" alt="FUSSIONBORN Logo">
      </div>
      <h1 class="fussionborn-title">FUSSIONBORN</h1>
      <div class="fussionborn-subtitle">El Modpack Oficial</div>
      <button class="fussionborn-play-btn" id="fussionbornPlayBtn" onclick="playFussionborn()">
        ⚡ Jugar Ahora
      </button>
      <div id="fussionbornStatus" style="margin-top:14px; font-size:.74rem; color:#fef08a; min-height:18px;"></div>
    </div>
    <!-- Column 2: Info & Illustrations -->
    <div class="fussionborn-right">
      [... todo el contenido de la columna derecha con features, galería, ajustes ...]
    </div>
  </div>
</div>
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 8: index.html — NAV_TAB_MAP entry (línea 2806)
// Agregar al objeto NAV_TAB_MAP:
// ─────────────────────────────────────────────────────────
/*
const NAV_TAB_MAP = { ..., pvp:'fussionborn', ... };
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 9: index.html — showTab pvp check (líneas 2818-2820)
// Dentro de la función showTab():
// ─────────────────────────────────────────────────────────
/*
if (id === 'pvp') {
    checkFussionbornInstalled();
}
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 10: index.html — Init calls (líneas 2736, 2771-2774)
// En la función init() después de cargar settings:
// ─────────────────────────────────────────────────────────
/*
checkFussionbornInstalled();
// ...
const fbRamSlider = document.getElementById('fbRamSlider');
if (fbRamSlider) fbRamSlider.max = totalRam;
loadFbSettings();
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 11: index.html — JS Functions completas (líneas 3542-3716)
// checkFussionbornInstalled, playFussionborn, updateFbRamSetting,
// saveFbSettings, loadFbSettings, checkFussionbornUpdate
// ─────────────────────────────────────────────────────────
/*
async function checkFussionbornInstalled() {
  const btn = document.getElementById('fussionbornPlayBtn');
  const statusEl = document.getElementById('fussionbornStatus');
  if (!btn) return;
  try {
    const installedModpacks = await ipc.invoke('get-installed-modpacks');
    const isInstalled = installedModpacks.some(m => m.folderName === 'Fussionborn');
    if (isInstalled) {
      btn.textContent = '⚡ Jugar Ahora';
      if (statusEl) statusEl.textContent = '✅ Instalado y listo para jugar.';
    } else {
      btn.textContent = '📥 Descargar e Instalar';
      if (statusEl) statusEl.textContent = 'No instalado. Haz clic para descargar.';
    }
  } catch(e) { console.error(e); }
}

async function playFussionborn() {
  if (!authUser) { toast('Inicia sesión primero en la pestaña Jugar.', 'error'); showTab('play'); return; }
  const btn = document.getElementById('fussionbornPlayBtn');
  const statusEl = document.getElementById('fussionbornStatus');
  btn.disabled = true;
  btn.textContent = '⏳ Verificando...';
  if (statusEl) statusEl.textContent = 'Verificando archivos de Fussionborn...';
  try {
    const installedModpacks = await ipc.invoke('get-installed-modpacks');
    const isInstalled = installedModpacks.some(m => m.folderName === 'Fussionborn');
    if (!isInstalled) {
      btn.textContent = '📥 Instalando...';
      if (statusEl) statusEl.textContent = 'Descargando modpack Fussionborn desde el servidor...';
      const res = await ipc.invoke('install-fussionborn');
      if (!res.success) {
        btn.disabled = false;
        btn.textContent = '📥 Descargar e Instalar';
        if (statusEl) statusEl.textContent = `❌ Error de instalación: ${res.error}`;
        toast(`❌ Error instalando Fussionborn: ${res.error}`, 'error');
        return;
      }
      installedMeta = await ipc.invoke('get-installed-versions');
      installed = new Set(installedMeta.map(v => v.id));
      populateInstalledModpacksSelect();
      const currentVer = await ipc.invoke('get-app-version');
      settings.fussionbornInstalledVersion = currentVer;
      ipc.send('save-settings', settings);
    }
    btn.textContent = '🚀 Iniciando...';
    if (statusEl) statusEl.textContent = 'Iniciando juego...';
    await launchModpack('Fussionborn');
    btn.disabled = false;
    btn.textContent = '⚡ Jugar Ahora';
    if (statusEl) statusEl.textContent = '✅ Listo para jugar.';
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '📥 Descargar e Instalar';
    if (statusEl) statusEl.textContent = `❌ Error: ${err.message}`;
    toast(`❌ Error: ${err.message}`, 'error');
  }
}

function updateFbRamSetting(val) {
  const display = document.getElementById('fbRamDisplay');
  if (parseInt(val) === 0) { display.textContent = 'Predeterminado'; } else { display.textContent = `${val} GB`; }
}

function saveFbSettings() {
  settings.fussionbornRam = parseInt(document.getElementById('fbRamSlider').value);
  settings.fussionbornJvmArgs = document.getElementById('fbJvmArgs').value.trim();
  ipc.send('save-settings', settings);
  toast('Ajustes de Fussionborn guardados.', 'success');
}

function loadFbSettings() {
  const ramVal = settings.fussionbornRam || 0;
  const jvmArgs = settings.fussionbornJvmArgs || '';
  const slider = document.getElementById('fbRamSlider');
  const input = document.getElementById('fbJvmArgs');
  if (slider) { slider.value = ramVal; updateFbRamSetting(ramVal); }
  if (input) { input.value = jvmArgs; }
}

async function checkFussionbornUpdate() {
  const btn = document.getElementById('fbUpdateCheckBtn');
  const statusEl = document.getElementById('fussionbornStatus');
  if (!btn) return;
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = '⏳ Comprobando...';
  toast('Comprobando actualizaciones de Fussionborn...', 'info');
  try {
    const currentVer = await ipc.invoke('get-app-version');
    const installedModpacks = await ipc.invoke('get-installed-modpacks');
    const isInstalled = installedModpacks.some(m => m.folderName === 'Fussionborn');
    if (!isInstalled) { toast('Fussionborn no está instalado aún.', 'warning'); return; }
    const lastInstalledVer = settings.fussionbornInstalledVersion || '2.0.4';
    if (lastInstalledVer !== currentVer) {
      const confirmUpdate = confirm(`¡Nueva actualización de Fussionborn disponible!\n\nVersión instalada: v${lastInstalledVer}\nÚltima versión: v${currentVer}\n\n¿Deseas descargar e instalar la actualización ahora?`);
      if (confirmUpdate) {
        const playBtn = document.getElementById('fussionbornPlayBtn');
        if (playBtn) { playBtn.disabled = true; playBtn.textContent = '📥 Actualizando...'; }
        if (statusEl) statusEl.textContent = 'Actualizando Fussionborn...';
        const res = await ipc.invoke('install-fussionborn');
        if (res.success) {
          settings.fussionbornInstalledVersion = currentVer;
          ipc.send('save-settings', settings);
          toast('¡Fussionborn actualizado con éxito! ✓', 'success');
          if (playBtn) { playBtn.disabled = false; playBtn.textContent = '⚡ Jugar Ahora'; }
        } else {
          toast(`❌ Error en la actualización: ${res.error}`, 'error');
          if (playBtn) { playBtn.disabled = false; playBtn.textContent = '⚡ Jugar Ahora'; }
        }
      }
    } else {
      toast(`Fussionborn ya está actualizado a la última versión (v${currentVer}).`, 'success');
    }
  } catch (err) {
    toast(`Error al comprobar actualización: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
*/

// ─────────────────────────────────────────────────────────
// SECCIÓN 12: index.html — launchModpack RAM override (líneas 4153-4154)
// Dentro de launchModpack(), reemplaza la línea de RAM:
// ─────────────────────────────────────────────────────────
/*
const isFussionborn = (folderName === 'Fussionborn');
const ram = (isFussionborn && settings.fussionbornRam) ? settings.fussionbornRam : document.getElementById('ramSlider').value;
*/

// ─────────────────────────────────────────────────────────
// IMÁGENES REQUERIDAS (copiar a resources/app/ del launcher)
// ─────────────────────────────────────────────────────────
/*
- fussionborn_logo.png       (logo dorado)
- fussionborn_gameplay1.png  (screenshot 1)
- fussionborn_gameplay2.png  (screenshot 2)
- fussionborn_creator.png    (avatar del creador BOOMBERBOY)
*/

// ─────────────────────────────────────────────────────────
// update.json — SECCIÓN MODPACK (eliminar si no se usa)
// ─────────────────────────────────────────────────────────
/*
"modpack": {
  "name": "FussionBorn",
  "version": "1.1.2",
  "minecraft": "1.21.1",
  "loader": {
    "type": "neoforge",
    "version": "21.1.233"
  },
  "download": {
    "url": "https://drive.usercontent.google.com/download?id=1U9PgwXMPTZT-xNoQzKjP8EtXdY7lSGuB&export=download&confirm=t",
    "format": "zip",
    "size": 1382659611
  }
}
*/
