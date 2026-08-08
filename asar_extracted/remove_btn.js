const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/asar_extracted/index.html';
let html = fs.readFileSync(path, 'utf8');

const targetBtn = '<button class="btn btn-primary btn-sm" style="font-size: 0.78rem; padding: 6px 12px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; font-weight: 600;" onclick="injectSmartPerformanceCombo()">✨ Inyectar Rendimiento IA</button>';

html = html.replace(targetBtn, '');
fs.writeFileSync(path, html, 'utf8');
console.log('Button removed successfully.');
