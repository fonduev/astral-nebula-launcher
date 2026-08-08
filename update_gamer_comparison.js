const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/index.html';
let html = fs.readFileSync(path, 'utf8');

const startIdx = html.indexOf('<tbody>');
const endIdx = html.indexOf('</tbody>') + 8;

const gamerTableBody = `<tbody>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row1">🚫 Cero Anuncios y 100% Gratuito</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ 100% Libre sin Popups</td>
            <td style="padding:14px; color:#f87171;">❌ Anuncios molesto</td>
            <td style="padding:14px; color:#34d399;">✅ Sin anuncios</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Anuncios banner</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Tienda/Cosméticos</td>
            <td style="padding:14px; color:#34d399;">✅ Sin anuncios</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row2">⚡ Aumento Real de FPS (+100 FPS)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Sodium+Lithium Auto</td>
            <td style="padding:14px; color:#f87171;">❌ Ninguno</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Parcial</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ Ninguno</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row3">📌 Ahorro Extremo de RAM (Modo Bandeja)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Libera RAM/CPU</td>
            <td style="padding:14px; color:#f87171;">❌ Consume memoria</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row4">👕 Skins 3D & Capas Gratis</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Visor 3D & Capas</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
            <td style="padding:14px; color:#f87171;">❌ Sin Visor 3D</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Capas de Pago</td>
            <td style="padding:14px; color:#f87171;">❌ Solo 2D</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row5">🎒 Modpacks, Texturas & Shaders 1-Clic</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Modrinth & CurseForge</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ Sin Modpacks</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row6">🎮 Cuentas No-Premium y Microsoft</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Soporte Total</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row7">👥 Chat de Amigos & Red Social</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Chat 1-a-1 & Fotos</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Amigos básico</td>
            <td style="padding:14px; color:#f87171;">❌ No tiene</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row8">🚀 Inicio Rápido (Menos de 2s)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Ultrarrápido</td>
            <td style="padding:14px; color:#f87171;">❌ Lento con carga</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Normal</td>
            <td style="padding:14px; color:#34d399;">✅ Rápido</td>
            <td style="padding:14px; color:#34d399;">✅ Rápido</td>
            <td style="padding:14px; color:#f87171;">❌ Muy Lento</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row9">🛡️ 100% Libre de Virus y Malware</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Seguro & Transparente</td>
            <td style="padding:14px; color:#f87171;">❌ Controversial (Spyware)</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Con Anuncios</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row10">🎨 Fondos Multimedia (GIFs/Videos HD)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ 3D, GIFs & Videos</td>
            <td style="padding:14px; color:#f87171;">❌ Estático</td>
            <td style="padding:14px; color:#f87171;">❌ Estático</td>
            <td style="padding:14px; color:#f87171;">❌ Básico</td>
            <td style="padding:14px; color:#f87171;">❌ Fijo</td>
            <td style="padding:14px; color:#f87171;">❌ Plano</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row11">☕ Auto-Instalador de Java (Sin errores)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Java 8/17/21/25 Auto</td>
            <td style="padding:14px; color:#f87171;">❌ Da errores frecuentemente</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#34d399;">✅ Auto</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Básico</td>
          </tr>
          <tr>
            <td style="padding:14px; font-weight:600;" data-i18n="row12">🌐 Idiomas Nativos (ES / EN / PT)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Auto-Detección Nativa</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#34d399;">✅ Varios</td>
          </tr>
        </tbody>`;

html = html.substring(0, startIdx) + gamerTableBody + html.substring(endIdx);

// Update WEB_TRANSLATIONS for row1 to row12
const oldTranslationsEs = `row1: "⚡ Optimización FPS (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 Fondos 3D & Estilo Van Gogh",
        row4: "📦 1-Clic Modpacks, Texturas & Shaders",
        row5: "🔒 100% Libre de Virus / Spyware",
        row6: "🌐 Tri-Idioma (ES / EN / PT)",
        row7: "👤 Modo Premium & Offline No-Premium",
        row8: "👤 Visor 3D Skins & Capas",
        row9: "👥 Red Social & Chat de Amigos",
        row10: "🌐 Monitoreo Servidores & Ping",
        row11: "🚀 Multi-Instancia Simultánea",
        row12: "☕ Auto-Instalación de Java",
        row13: "🎨 Temas Visuales Personalizados",
        row14: "🔄 Auto-Actualizaciones en 2º Plano"`;

const newTranslationsEs = `row1: "🚫 Cero Anuncios y 100% Gratuito",
        row2: "⚡ Aumento Real de FPS (+100 FPS)",
        row3: "📌 Ahorro Extremo de RAM (Modo Bandeja)",
        row4: "👕 Skins 3D & Capas Gratis",
        row5: "🎒 Modpacks, Texturas & Shaders 1-Clic",
        row6: "🎮 Cuentas No-Premium y Microsoft",
        row7: "👥 Chat de Amigos & Red Social",
        row8: "🚀 Inicio Rápido (Menos de 2s)",
        row9: "🛡️ 100% Libre de Virus y Malware",
        row10: "🎨 Fondos Multimedia (GIFs/Videos HD)",
        row11: "☕ Auto-Instalador de Java (Sin errores)",
        row12: "🌐 Idiomas Nativos (ES / EN / PT)"`;

html = html.replace(oldTranslationsEs, newTranslationsEs);

const oldTranslationsEn = `row1: "⚡ FPS Optimization (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 3D & Van Gogh Backgrounds",
        row4: "📦 1-Click Modpacks, Textures & Shaders",
        row5: "🔒 100% Virus / Spyware Free",
        row6: "🌐 Tri-Language (ES / EN / PT)",
        row7: "👤 Premium & Offline Mode",
        row8: "👤 3D Skin Viewer & Capes",
        row9: "👥 Social Network & Friends Chat",
        row10: "🌐 Server Monitoring & Ping",
        row11: "🚀 Multi-Instance Support",
        row12: "☕ Auto Java Setup (8/17/21/25)",
        row13: "🎨 Custom Visual Themes",
        row14: "🔄 Background Auto-Updates"`;

const newTranslationsEn = `row1: "🚫 Zero Ads & 100% Free Forever",
        row2: "⚡ Massive FPS Boost (+100 FPS)",
        row3: "📌 Extreme RAM Saver (System Tray)",
        row4: "👕 Free 3D Skins & Capes",
        row5: "🎒 1-Click Modpacks, Textures & Shaders",
        row6: "🎮 Offline No-Premium & Microsoft Accounts",
        row7: "👥 Friends Chat & Social Network",
        row8: "🚀 Ultra Fast Startup (< 2 seconds)",
        row9: "🛡️ 100% Safe (No Malware / Spyware)",
        row10: "🎨 Animated Media Backgrounds (GIFs/Videos)",
        row11: "☕ Auto Java Installer (Error Free)",
        row12: "🌐 Native Languages (ES / EN / PT)"`;

html = html.replace(oldTranslationsEn, newTranslationsEn);

const oldTranslationsPt = `row1: "⚡ Otimização FPS (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 Fundos 3D & Estilo Van Gogh",
        row4: "📦 1-Clique Modpacks, Texturas & Shaders",
        row5: "🔒 100% Livre de Vírus / Spyware",
        row6: "🌐 Tri-Idioma (ES / EN / PT)",
        row7: "👤 Modo Premium & Offline",
        row8: "👤 Visualizador 3D de Skins & Capas",
        row9: "👥 Rede Social & Chat de Amigos",
        row10: "🌐 Monitoramento de Servidores & Ping",
        row11: "🚀 Suporte Multi-Instância",
        row12: "☕ Auto-Instalação do Java",
        row13: "🎨 Temas Visuais Personalizados",
        row14: "🔄 Atualizações em Segundo Plano"`;

const newTranslationsPt = `row1: "🚫 Sem Anúncios & 100% Grátis",
        row2: "⚡ Aumento Real de FPS (+100 FPS)",
        row3: "📌 Economia Extrema de RAM (Modo Bandeja)",
        row4: "👕 Skins 3D & Capas Grátis",
        row5: "🎒 Modpacks, Texturas & Shaders em 1-Clique",
        row6: "🎮 Contas Offline & Microsoft",
        row7: "👥 Chat de Amigos & Rede Social",
        row8: "🚀 Inicialização Ultra Rápida (< 2s)",
        row9: "🛡️ 100% Seguro (Sem Malware)",
        row10: "🎨 Fundos de Mídia Animados (GIFs/Vídeos)",
        row11: "☕ Auto-Instalador do Java",
        row12: "🌐 Idiomas Nativos (ES / EN / PT)"`;

html = html.replace(oldTranslationsPt, newTranslationsPt);

fs.writeFileSync(path, html, 'utf8');
console.log('Comparison table updated with high-interest gamer features!');
