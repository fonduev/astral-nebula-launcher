const fs = require('fs');
const filePath = 'C:/Users/renee/Documents/Web/index.html';
let html = fs.readFileSync(filePath, 'utf8');

// Replace versions in links and text
html = html.replace(/v4\.1\.[0-9]/g, 'v4.1.2');
html = html.replace(/4\.1\.[0-9]/g, '4.1.2');

// Fix portable zip link if present to point to setup exe or v4.1.2 release asset
html = html.replace(/Nebula-Launcher-v4\.1\.2-Portable\.zip/g, 'Nebula.Launcher.Setup.4.1.2.exe');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated index.html landing page to v4.1.2!');
