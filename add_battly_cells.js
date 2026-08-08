const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/index.html';
let html = fs.readFileSync(path, 'utf8');

const startIdx = html.indexOf('<tbody>');
const endIdx = html.indexOf('</tbody>') + 8;

const newTableBody = `<tbody>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row1">⚡ Optimización FPS (Sodium+Lithium)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Integrado Auto</td>
            <td style="padding:14px; color:#f87171;">❌ Manual</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ Ninguna</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row2">📌 Tray Resource Saver (RAM/CPU)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Sí (Auto)</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row3">🎨 Fondos 3D & Estilo Van Gogh</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Único & Animado</td>
            <td style="padding:14px; color:#f87171;">❌ Estático</td>
            <td style="padding:14px; color:#f87171;">❌ Estático</td>
            <td style="padding:14px; color:#f87171;">❌ Básico</td>
            <td style="padding:14px; color:#f87171;">❌ Fijo</td>
            <td style="padding:14px; color:#f87171;">❌ Plano</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row4">📦 1-Clic Modpacks, Texturas & Shaders</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Modrinth & CurseForge</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ Sin Modpacks</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row5">🔒 100% Libre de Virus / Spyware</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Seguro & Transparente</td>
            <td style="padding:14px; color:#f87171;">❌ Controversial</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Con anuncios</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row6">🌐 Tri-Idioma (ES / EN / PT)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Nativo & Auto-detect</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#34d399;">✅ Varios</td>
          </tr>
          <tr>
            <td style="padding:14px; font-weight:600;" data-i18n="row7">👤 Modo Premium & Offline No-Premium</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Ambos integrados</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
          </tr>
        </tbody>`;

html = html.substring(0, startIdx) + newTableBody + html.substring(endIdx);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully replaced table body!');
