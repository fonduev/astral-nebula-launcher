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
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row7">👤 Modo Premium & Offline No-Premium</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Ambos integrados</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row8">👤 Visor 3D Skins & Capas</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Integrado 3D</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#f87171;">❌ Básico</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ De Pago</td>
            <td style="padding:14px; color:#f87171;">❌ Plano 2D</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row9">👥 Red Social & Chat de Amigos</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Mensajes & Fotos</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Amigos</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row10">🌐 Monitoreo Servidores & Ping</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Latencia en ms</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row11">🚀 Multi-Instancia Simultánea</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Hasta 3 juegos</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row12">☕ Auto-Instalación de Java</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Java 8/17/21/25</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row13">🎨 Temas Visuales Personalizados</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Personalizado</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr>
            <td style="padding:14px; font-weight:600;" data-i18n="row14">🔄 Auto-Actualizaciones en 2º Plano</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Transparente</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Manual</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Manual</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Manual</td>
          </tr>
        </tbody>`;

html = html.substring(0, startIdx) + newTableBody + html.substring(endIdx);

// Also update WEB_TRANSLATIONS for row8 to row14
const oldTranslationsEs = `row7: "👤 Modo Premium & Offline No-Premium"`;
const newTranslationsEs = `row7: "👤 Modo Premium & Offline No-Premium",
        row8: "👤 Visor 3D Skins & Capas",
        row9: "👥 Red Social & Chat de Amigos",
        row10: "🌐 Monitoreo Servidores & Ping",
        row11: "🚀 Multi-Instancia Simultánea",
        row12: "☕ Auto-Instalación de Java",
        row13: "🎨 Temas Visuales Personalizados",
        row14: "🔄 Auto-Actualizaciones en 2º Plano"`;

html = html.replace(oldTranslationsEs, newTranslationsEs);

const oldTranslationsEn = `row7: "👤 Premium & Offline Mode"`;
const newTranslationsEn = `row7: "👤 Premium & Offline Mode",
        row8: "👤 3D Skin Viewer & Capes",
        row9: "👥 Social Network & Friends Chat",
        row10: "🌐 Server Monitoring & Ping",
        row11: "🚀 Multi-Instance Support",
        row12: "☕ Auto Java Setup (8/17/21/25)",
        row13: "🎨 Custom Visual Themes",
        row14: "🔄 Background Auto-Updates"`;

html = html.replace(oldTranslationsEn, newTranslationsEn);

const oldTranslationsPt = `row7: "👤 Modo Premium & Offline"`;
const newTranslationsPt = `row7: "👤 Modo Premium & Offline",
        row8: "👤 Visualizador 3D de Skins & Capas",
        row9: "👥 Rede Social & Chat de Amigos",
        row10: "🌐 Monitoramento de Servidores & Ping",
        row11: "🚀 Suporte Multi-Instância",
        row12: "☕ Auto-Instalação do Java",
        row13: "🎨 Temas Visuais Personalizados",
        row14: "🔄 Atualizações em Segundo Plano"`;

html = html.replace(oldTranslationsPt, newTranslationsPt);

fs.writeFileSync(path, html, 'utf8');
console.log('Comparison table expanded to 14 rows with complete ES/EN/PT translations!');
