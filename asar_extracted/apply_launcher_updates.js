const fs = require('fs');

// 1. Update main.js with search-resourcepacks & download-resourcepack IPC handlers
const mainPath = 'C:/Users/renee/Documents/Web/asar_extracted/main.js';
let mainJs = fs.readFileSync(mainPath, 'utf8');

if (!mainJs.includes("ipcMain.handle('search-resourcepacks'")) {
    const resourcepackHandlers = `
ipcMain.handle('search-resourcepacks', async (event, { query = '', type = 'resourcepack' }) => {
    const results = [];
    try {
        const projectType = type === 'shader' ? 'shader' : 'resourcepack';
        const limit = 24;
        const url = \`https://api.modrinth.com/v2/search?query=\${encodeURIComponent(query)}&facets=[["project_type:\${projectType}"]]&limit=\${limit}&index=downloads\`;
        const resData = await httpsGet(url);
        const searchResult = JSON.parse(resData);
        searchResult.hits.forEach(h => {
            results.push({
                source: 'modrinth',
                projectId: h.project_id,
                title: h.title,
                description: h.description,
                iconUrl: h.icon_url || '',
                categories: h.categories || [],
                downloads: h.downloads || 0,
                author: h.author || ''
            });
        });
    } catch (err) {
        sendLog(\`⚠️ Error buscando \${type}: \${err.message}\`);
    }
    return results;
});

ipcMain.handle('download-resourcepack', async (event, { projectId, type = 'resourcepack' }) => {
    try {
        const s = loadSettings();
        const mcPath = getMcPath(s.gameDir);
        const targetSubDir = type === 'shader' ? 'shaderpacks' : 'resourcepacks';
        const targetDir = path.join(mcPath, targetSubDir);
        fs.mkdirSync(targetDir, { recursive: true });

        sendLog(\`🔍 Obteniendo archivo de \${type} (\${projectId})...\`);
        const versionsUrl = \`https://api.modrinth.com/v2/project/\${projectId}/version\`;
        const versionsData = await httpsGet(versionsUrl);
        const versions = JSON.parse(versionsData);
        if (!versions || versions.length === 0) throw new Error('No hay versiones disponibles.');

        const primaryVersion = versions[0];
        const primaryFile = primaryVersion.files.find(f => f.primary) || primaryVersion.files[0];
        if (!primaryFile) throw new Error('No se encontró archivo de descarga.');

        const destPath = path.join(targetDir, primaryFile.filename);
        sendLog(\`📥 Descargando \${primaryFile.filename} en \${targetSubDir}...\`);
        await downloadFile(primaryFile.url, destPath);
        sendLog(\`✅ \${type === 'shader' ? 'Shader' : 'Textura'} instalada: \${primaryFile.filename}\`);
        return { success: true, filename: primaryFile.filename };
    } catch (err) {
        sendLog(\`❌ Error descargando \${type}: \${err.message}\`, 'error');
        return { success: false, error: err.message };
    }
});
`;
    mainJs += '\n' + resourcepackHandlers;
    fs.writeFileSync(mainPath, mainJs, 'utf8');
    console.log('main.js updated with resourcepack & shader IPC handlers.');
}

// 2. Update index.html with nav item, tab panel, and language engine
const htmlPath = 'C:/Users/renee/Documents/Web/asar_extracted/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Insert Sidebar Nav Item
const oldNavPart = `<button class="nav-item" onclick="showTab('modpacks')">
          <span class="nav-icon">🎒</span>
          Modpacks
        </button>`;

const newNavPart = `<button class="nav-item" onclick="showTab('modpacks')">
          <span class="nav-icon">🎒</span>
          Modpacks
        </button>
        <button class="nav-item" onclick="showTab('resourcepacks')">
          <span class="nav-icon">🎨</span>
          Texturas & Shaders
        </button>`;

if (html.includes(oldNavPart) && !html.includes("showTab('resourcepacks')")) {
    html = html.replace(oldNavPart, newNavPart);
}

// Insert Language Card in Settings
const settingsTarget = `<div class="settings-card">
              <h3>⚡ RAM POR DEFECTO`;

const languageCardHtml = `<div class="settings-card">
              <h3 data-i18n="lang_title">🌐 IDIOMA / LANGUAGE</h3>
              <p style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px;" data-i18n="lang_desc">Selecciona el idioma de la interfaz del launcher:</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-sm btn-ghost lang-btn" id="lang-btn-es" onclick="setLauncherLanguage('es')">🇪🇸 Español</button>
                <button class="btn btn-sm btn-ghost lang-btn" id="lang-btn-en" onclick="setLauncherLanguage('en')">🇺🇸 English</button>
                <button class="btn btn-sm btn-ghost lang-btn" id="lang-btn-pt" onclick="setLauncherLanguage('pt')">🇧🇷 Português</button>
              </div>
            </div>

            <div class="settings-card">
              <h3>⚡ RAM POR DEFECTO`;

if (html.includes(settingsTarget) && !html.includes('id="lang-btn-es"')) {
    html = html.replace(settingsTarget, languageCardHtml);
}

// Insert Tab Panel for Resourcepacks
const tabTarget = `<div class="tab-panel" id="tab-modpacks">`;
const resourcepacksTabHtml = `
      <!-- ═══════ TEXTURAS & SHADERS TAB ═══════ -->
      <div class="tab-panel" id="tab-resourcepacks">
        <h1 class="panel-title">🎨 Texturas & Shaders</h1>
        <p class="panel-sub">Descarga Resource Packs y Shaders en 1-clic directamente a tu juego.</p>

        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
          <input type="text" class="inp" id="rpSearchInp" placeholder="Buscar textura o shader..." style="max-width:320px;" onkeyup="if(event.key==='Enter') searchResourcepacks()">
          <select class="inp" id="rpTypeSel" style="max-width:180px;" onchange="searchResourcepacks()">
            <option value="resourcepack">🎨 Texturas (Resourcepacks)</option>
            <option value="shader">✨ Shaders (Shaderpacks)</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="searchResourcepacks()">🔍 Buscar</button>
        </div>

        <div id="rpResultsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;overflow-y:auto;max-height:calc(100vh - 220px);padding-right:4px;">
          <!-- Se llena dinámicamente -->
        </div>
      </div>

      <div class="tab-panel" id="tab-modpacks">`;

if (html.includes(tabTarget) && !html.includes('id="tab-resourcepacks"')) {
    html = html.replace(tabTarget, resourcepacksTabHtml);
}

// Add Script for Resourcepacks and Language Engine
const endScriptTarget = `</body>`;
const launcherScript = `
  <script>
    // Engine de Búsqueda de Texturas y Shaders
    async function searchResourcepacks() {
      const q = document.getElementById('rpSearchInp').value.trim();
      const type = document.getElementById('rpTypeSel').value;
      const grid = document.getElementById('rpResultsGrid');
      if (!grid) return;

      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-dim);">⏳ Buscando packs en Modrinth...</div>';

      try {
        const results = await ipc.invoke('search-resourcepacks', { query: q, type: type });
        if (!results || results.length === 0) {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-dim);">No se encontraron resultados.</div>';
          return;
        }

        grid.innerHTML = results.map(item => \`
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;backdrop-filter:blur(10px);">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="\${item.iconUrl || './icon.ico'}" style="width:42px;height:42px;border-radius:10px;object-fit:cover;" onerror="this.src='./icon.ico'">
              <div style="overflow:hidden;">
                <div style="font-weight:700;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${item.title}</div>
                <div style="font-size:0.72rem;color:var(--text-dim);">Por \${item.author || 'Desconocido'} • 📥 \${item.downloads.toLocaleString()}</div>
              </div>
            </div>
            <div style="font-size:0.75rem;color:var(--text-dim);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;">
              \${item.description || 'Sin descripción disponible.'}
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:auto;" onclick="downloadResourcepackItem('\${item.projectId}', '\${type}')">
              ⬇ Instalar \${type === 'shader' ? 'Shader' : 'Textura'}
            </button>
          </div>
        \`).join('');
      } catch (e) {
        grid.innerHTML = \`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--red);">Error: \${e.message}</div>\`;
      }
    }

    async function downloadResourcepackItem(projectId, type) {
      toast(\`⏳ Descargando \${type === 'shader' ? 'Shader' : 'Textura'}...\`, 'info');
      const res = await ipc.invoke('download-resourcepack', { projectId, type });
      if (res.success) {
        toast(\`✅ \${res.filename} instalada correctamente!\`, 'success');
      } else {
        toast(\`❌ Error: \${res.error}\`, 'error');
      }
    }

    // Engine de Idioma Launcher
    function setLauncherLanguage(lang) {
      settings.language = lang;
      ipc.send('save-settings', settings);
      updateLangUIBtns(lang);
      toast(\`🌐 Idioma cambiado a \${lang.toUpperCase()}\`, 'success');
    }

    function updateLangUIBtns(lang) {
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--border)';
        b.style.background = 'none';
      });
      const activeBtn = document.getElementById('lang-btn-' + lang);
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderColor = 'var(--accent)';
        activeBtn.style.background = 'var(--btn-glass)';
      }
    }
  </script>
</body>`;

if (!html.includes('searchResourcepacks')) {
    html = html.replace(endScriptTarget, launcherScript);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Launcher index.html updated successfully with Resourcepacks tab and Language engine.');
