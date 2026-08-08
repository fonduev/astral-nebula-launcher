const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Reemplazar enlaces de Discord
html = html.split('https://discord.gg/B9cPHHCK6').join('https://discord.gg/QjrRHZtHw8');
html = html.split('B9cPHHCK6').join('QjrRHZtHw8');

// 2. Agregar nav links con data-i18n y selector de idioma en el Navbar
const oldNav = `<li><a href="#caracteristicas" class="nav-link">Características</a></li>
        <li><a href="#showcase" class="nav-link">Demostración</a></li>
        <li><a href="#modpacks" class="nav-link">Modpacks</a></li>
        <li><a href="#discord" class="nav-link">Comunidad</a></li>`;

const newNav = `<li><a href="#caracteristicas" class="nav-link" data-i18n="nav_features">Características</a></li>
        <li><a href="#showcase" class="nav-link" data-i18n="nav_showcase">Demostración</a></li>
        <li><a href="#comparativa" class="nav-link" data-i18n="nav_comparison">Comparativa</a></li>
        <li><a href="#modpacks" class="nav-link" data-i18n="nav_modpacks">Modpacks</a></li>
        <li><a href="#discord" class="nav-link" data-i18n="nav_community">Comunidad</a></li>
        <li>
          <div class="lang-picker" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);padding:5px 12px;border-radius:12px;border:1px solid var(--border-glass);">
            <span style="font-size:0.9rem;">🌐</span>
            <select id="webLangSelect" onchange="setWebLanguage(this.value)" style="background:none;border:none;color:var(--text-main);font-family:var(--font-body);font-size:0.85rem;font-weight:700;cursor:pointer;outline:none;">
              <option value="es" style="background:#080415;color:#fff;">ES 🇪🇸</option>
              <option value="en" style="background:#080415;color:#fff;">EN 🇺🇸</option>
              <option value="pt" style="background:#080415;color:#fff;">PT 🇧🇷</option>
            </select>
          </div>
        </li>`;

html = html.replace(oldNav, newNav);

// 3. Añadir la Sección de Comparativa de Launchers antes de #discord
const comparisonSection = `
  <!-- ── SECCIÓN DE COMPARATIVA DE LAUNCHERS ── -->
  <section class="features" id="comparativa" style="padding-top:4rem; padding-bottom:4rem;">
    <div class="section-title">
      <div class="hero-badge" style="margin-bottom:1rem;" data-i18n="comp_badge">⚡ COMPARATIVA DE LAUNCHERS</div>
      <h2 data-i18n="comp_title">¿Por qué <span class="glow-text">Nebula Launcher</span> es superior?</h2>
      <p data-i18n="comp_sub">Compara las características clave de Nebula frente a otros launchers tradicionales y descubre la diferencia.</p>
    </div>

    <div style="overflow-x:auto; background:var(--bg-card); border:1px solid var(--border-glass); border-radius:24px; padding:1.5rem; backdrop-filter:blur(16px);">
      <table style="width:100%; border-collapse:collapse; min-width:700px; text-align:left; font-size:0.95rem;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-glass);">
            <th style="padding:16px;" data-i18n="th_feature">Característica</th>
            <th style="padding:16px; color:var(--accent-purple); font-size:1.1rem; font-weight:800;">🌌 Nebula Launcher</th>
            <th style="padding:16px; color:var(--text-muted);">TLauncher</th>
            <th style="padding:16px; color:var(--text-muted);">Feather / Dawn</th>
            <th style="padding:16px; color:var(--text-muted);">Lunar Client</th>
            <th style="padding:16px; color:var(--text-muted);">Mojang Oficial</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row1">⚡ Optimización FPS (Sodium+Lithium)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Integrado Auto</td>
            <td style="padding:14px; color:#f87171;">❌ Manual</td>
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
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row3">🎨 Fondos 3D & Estilo Van Gogh</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Único & Animado</td>
            <td style="padding:14px; color:#f87171;">❌ Estático</td>
            <td style="padding:14px; color:#f87171;">❌ Básico</td>
            <td style="padding:14px; color:#f87171;">❌ Fijo</td>
            <td style="padding:14px; color:#f87171;">❌ Plano</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row4">📦 1-Clic Modpacks, Texturas & Shaders</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Modrinth & CurseForge</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>
            <td style="padding:14px; color:#34d399;">✅ Sí</td>
            <td style="padding:14px; color:#f87171;">❌ Sin Modpacks</td>
            <td style="padding:14px; color:#f87171;">❌ No</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row5">🔒 100% Libre de Virus / Spyware</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Seguro & Transparente</td>
            <td style="padding:14px; color:#f87171;">❌ Controversial</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Con anuncios</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
            <td style="padding:14px; color:#34d399;">✅ Seguro</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:14px; font-weight:600;" data-i18n="row6">🌐 Tri-Idioma (ES / EN / PT)</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Nativo & Auto-detect</td>
            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>
            <td style="padding:14px; color:#34d399;">✅ Varios</td>
          </tr>
          <tr>
            <td style="padding:14px; font-weight:600;" data-i18n="row7">👤 Modo Premium & Offline No-Premium</td>
            <td style="padding:14px; color:#34d399; font-weight:700;">✅ Ambos integrados</td>
            <td style="padding:14px; color:#34d399;">✅ Ambos</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
`;

html = html.replace('<section class="discord-section" id="discord">', comparisonSection + '\n  <section class="discord-section" id="discord">');

// 4. Agregar script de I18N al final
const i18nScript = `
  <!-- ── ENGINE MOTOR DE TRADUCCIÓN TRI-IDIOMA (ES / EN / PT) ── -->
  <script>
    const WEB_TRANSLATIONS = {
      es: {
        nav_features: "Características",
        nav_showcase: "Demostración",
        nav_comparison: "Comparativa",
        nav_modpacks: "Modpacks",
        nav_community: "Comunidad",
        comp_badge: "⚡ COMPARATIVA DE LAUNCHERS",
        comp_title: "¿Por qué Nebula Launcher es superior?",
        comp_sub: "Compara las características clave de Nebula frente a otros launchers tradicionales y descubre la diferencia.",
        th_feature: "Característica",
        row1: "⚡ Optimización FPS (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 Fondos 3D & Estilo Van Gogh",
        row4: "📦 1-Clic Modpacks, Texturas & Shaders",
        row5: "🔒 100% Libre de Virus / Spyware",
        row6: "🌐 Tri-Idioma (ES / EN / PT)",
        row7: "👤 Modo Premium & Offline No-Premium"
      },
      en: {
        nav_features: "Features",
        nav_showcase: "Showcase",
        nav_comparison: "Comparison",
        nav_modpacks: "Modpacks",
        nav_community: "Community",
        comp_badge: "⚡ LAUNCHER COMPARISON",
        comp_title: "Why is Nebula Launcher superior?",
        comp_sub: "Compare Nebula's key features against traditional launchers and discover the difference.",
        th_feature: "Feature",
        row1: "⚡ FPS Optimization (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 3D & Van Gogh Backgrounds",
        row4: "📦 1-Click Modpacks, Textures & Shaders",
        row5: "🔒 100% Virus / Spyware Free",
        row6: "🌐 Tri-Language (ES / EN / PT)",
        row7: "👤 Premium & Offline Mode"
      },
      pt: {
        nav_features: "Recursos",
        nav_showcase: "Demonstração",
        nav_comparison: "Comparativa",
        nav_modpacks: "Modpacks",
        nav_community: "Comunidade",
        comp_badge: "⚡ COMPARATIVO DE LAUNCHERS",
        comp_title: "Por que o Nebula Launcher é superior?",
        comp_sub: "Compare os recursos do Nebula com outros launchers tradicionais e descubra a diferença.",
        th_feature: "Recurso",
        row1: "⚡ Otimização FPS (Sodium+Lithium)",
        row2: "📌 Tray Resource Saver (RAM/CPU)",
        row3: "🎨 Fundos 3D & Estilo Van Gogh",
        row4: "📦 1-Clique Modpacks, Texturas & Shaders",
        row5: "🔒 100% Livre de Vírus / Spyware",
        row6: "🌐 Tri-Idioma (ES / EN / PT)",
        row7: "👤 Modo Premium & Offline"
      }
    };

    function setWebLanguage(lang) {
      if (!WEB_TRANSLATIONS[lang]) lang = 'es';
      localStorage.setItem('nebula_web_lang', lang);
      const sel = document.getElementById('webLangSelect');
      if (sel) sel.value = lang;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (WEB_TRANSLATIONS[lang][key]) {
          if (el.children.length === 0) {
            el.textContent = WEB_TRANSLATIONS[lang][key];
          } else {
            // Preservar elementos hijos si existen
            const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3);
            if (textNode) textNode.nodeValue = WEB_TRANSLATIONS[lang][key];
          }
        }
      });
    }

    // Auto-detectar idioma por navegador
    (function autoDetectLanguage() {
      const saved = localStorage.getItem('nebula_web_lang');
      if (saved) {
        setWebLanguage(saved);
        return;
      }
      const navLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
      let defaultLang = 'en';
      if (navLang.startsWith('es')) defaultLang = 'es';
      else if (navLang.startsWith('pt')) defaultLang = 'pt';
      setWebLanguage(defaultLang);
    })();
  </script>
`;

html = html.replace('</body>', i18nScript + '\n</body>');

fs.writeFileSync(path, html, 'utf8');
console.log('Web index.html updated successfully with Discord link, Comparison section, and Tri-Language support!');
