const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/asar_extracted/index.html';
let html = fs.readFileSync(path, 'utf8');

const targetStr = '<div class="settings-grid">';

const cardHtml = `<div class="settings-grid">
            <!-- 🌐 IDIOMA DEL LAUNCHER -->
            <div class="settings-card" id="settings-lang-card" style="border: 1px solid rgba(192, 132, 252, 0.3); background: rgba(192, 132, 252, 0.05); grid-column: 1 / -1;">
              <h3 id="lbl-lang-title">🌐 IDIOMA DE LA INTERFAZ / LANGUAGE</h3>
              <p id="lbl-lang-desc" style="font-size:.75rem;color:var(--text-dim);margin-bottom:14px;line-height:1.5;">
                Selecciona el idioma preferido para la interfaz del launcher:
              </p>
              <div style="display:flex; gap:10px; flex-wrap:wrap; -webkit-app-region: no-drag;">
                <button class="btn btn-ghost btn-sm lang-btn" id="lang-btn-es" onclick="changeAppLanguage('es')" style="padding: 8px 16px; font-weight: 700; border-radius: 10px;">🇪🇸 Español</button>
                <button class="btn btn-ghost btn-sm lang-btn" id="lang-btn-en" onclick="changeAppLanguage('en')" style="padding: 8px 16px; font-weight: 700; border-radius: 10px;">🇺🇸 English</button>
                <button class="btn btn-ghost btn-sm lang-btn" id="lang-btn-pt" onclick="changeAppLanguage('pt')" style="padding: 8px 16px; font-weight: 700; border-radius: 10px;">🇧🇷 Português</button>
              </div>
            </div>`;

if (html.includes(targetStr) && !html.includes('id="settings-lang-card"')) {
    html = html.replace(targetStr, cardHtml);
    fs.writeFileSync(path, html, 'utf8');
    console.log('Successfully inserted language card into settings grid!');
} else {
    console.log('Language card already exists or target not found.');
}
