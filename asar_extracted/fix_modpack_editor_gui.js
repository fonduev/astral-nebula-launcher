const fs = require('fs');
const path = 'C:/Users/renee/Documents/Web/asar_extracted/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Update .modal-overlay and .modal-content CSS rules
const oldModalOverlayCss = `.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 20, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}`;

const newModalOverlayCss = `.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 20, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  isolation: isolate;
  transform: translateZ(0);
}`;

html = html.replace(oldModalOverlayCss, newModalOverlayCss);

const oldModalContentCss = `.modal-content {
  background: rgba(14, 12, 26, 0.92);
  border: 1px solid rgba(192, 132, 252, 0.18);
  border-radius: 24px;
  padding: 36px 30px 30px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(192, 132, 252, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}`;

const newModalContentCss = `.modal-content {
  background: #0d0a1d;
  border: 1px solid rgba(192, 132, 252, 0.25);
  border-radius: 24px;
  padding: 36px 30px 30px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(192, 132, 252, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  isolation: isolate;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}`;

html = html.replace(oldModalContentCss, newModalContentCss);

// 2. Add GPU isolation to #mpe-local-list and #mpe-search-results
html = html.replace(
  'id="mpe-local-list" style="flex: 1; overflow-y: auto;',
  'id="mpe-local-list" style="flex: 1; overflow-y: auto; transform: translateZ(0); contain: paint layout;'
);

html = html.replace(
  'id="mpe-search-results" style="flex: 1; overflow-y: auto;',
  'id="mpe-search-results" style="flex: 1; overflow-y: auto; transform: translateZ(0); contain: paint layout;'
);

// 3. Ensure panels in #modpack-editor-modal have solid opaque background
html = html.replace(
  'style="width: 35%; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);',
  'style="width: 35%; display: flex; flex-direction: column; background: #130f28; transform: translateZ(0); contain: paint layout;'
);

html = html.replace(
  'style="width: 65%; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);',
  'style="width: 65%; display: flex; flex-direction: column; background: #130f28; transform: translateZ(0); contain: paint layout;'
);

fs.writeFileSync(path, html, 'utf8');
console.log('Fixed Modpack Editor GPU clipping glitch!');
