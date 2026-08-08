const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Fix the duplicate title structure
const oldHeader = `<h2 data-i18n="comp_title">¿Por qué <span class="glow-text">Nebula Launcher</span> es superior?</h2>`;
const newHeader = `<h2><span data-i18n="comp_title_1">¿Por qué </span><span class="glow-text">Nebula Launcher</span><span data-i18n="comp_title_2"> es superior?</span></h2>`;

html = html.replace(oldHeader, newHeader);

// 2. Add Battly Launcher column to the comparison table
const oldTableHead = `<th style="padding:16px; color:var(--text-muted);">TLauncher</th>
            <th style="padding:16px; color:var(--text-muted);">Feather / Dawn</th>`;

const newTableHead = `<th style="padding:16px; color:var(--text-muted);">TLauncher</th>
            <th style="padding:16px; color:var(--text-muted);">Battly Launcher</th>
            <th style="padding:16px; color:var(--text-muted);">Feather / Dawn</th>`;

html = html.replace(oldTableHead, newTableHead);

// Add Battly row values to each <tr>
html = html.replace(
    `<td style="padding:14px; color:#f87171;">❌ Manual</td>\n            <td style="padding:14px; color:#34d399;">✅ Parcial</td>`,
    `<td style="padding:14px; color:#f87171;">❌ Manual</td>\n            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>\n            <td style="padding:14px; color:#34d399;">✅ Parcial</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>`,
    `<td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>\n            <td style="padding:14px; color:#f87171;">❌ No</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#f87171;">❌ Estático</td>\n            <td style="padding:14px; color:#f87171;">❌ Básico</td>`,
    `<td style="padding:14px; color:#f87171;">❌ Estático</td>\n            <td style="padding:14px; color:#f87171;">❌ Estático</td>\n            <td style="padding:14px; color:#f87171;">❌ Básico</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>\n            <td style="padding:14px; color:#34d399;">✅ Sí</td>`,
    `<td style="padding:14px; color:#fbbf24;">⚠️ Limitado</td>\n            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>\n            <td style="padding:14px; color:#34d399;">✅ Sí</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#f87171;">❌ Controversial</td>\n            <td style="padding:14px; color:#fbbf24;">⚠️ Con anuncios</td>`,
    `<td style="padding:14px; color:#f87171;">❌ Controversial</td>\n            <td style="padding:14px; color:#34d399;">✅ Seguro</td>\n            <td style="padding:14px; color:#fbbf24;">⚠️ Con anuncios</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>\n            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>`,
    `<td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>\n            <td style="padding:14px; color:#fbbf24;">⚠️ Parcial</td>\n            <td style="padding:14px; color:#f87171;">❌ Solo Inglés</td>`
);

html = html.replace(
    `<td style="padding:14px; color:#34d399;">✅ Ambos</td>\n            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>`,
    `<td style="padding:14px; color:#34d399;">✅ Ambos</td>\n            <td style="padding:14px; color:#34d399;">✅ Ambos</td>\n            <td style="padding:14px; color:#f87171;">❌ Solo Premium</td>`
);

// Update WEB_TRANSLATIONS for comp_title_1 and comp_title_2
html = html.replace(
    'comp_title: "¿Por qué Nebula Launcher es superior?",',
    'comp_title_1: "¿Por qué ", comp_title_2: " es superior?",'
);
html = html.replace(
    'comp_title: "Why is Nebula Launcher superior?",',
    'comp_title_1: "Why is ", comp_title_2: " superior?",'
);
html = html.replace(
    'comp_title: "Por que o Nebula Launcher é superior?",',
    'comp_title_1: "Por que o ", comp_title_2: " é superior?",'
);

fs.writeFileSync(path, html, 'utf8');
console.log('Comparison table updated with Battly Launcher and title duplication fixed!');
