
    (function initUniversalThemeCanvasAnimation() {
      const canvas = document.getElementById('vanGoghCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });

      function getActiveTheme() {
        return document.documentElement.getAttribute('data-theme') || 
               (document.body && document.body.getAttribute('data-theme')) || 
               'nebula';
      }

      function getThemeColors() {
        const theme = getActiveTheme();
        switch(theme) {
          case 'custom': {
            const ct = (window.settings && window.settings.customTheme) || {};
            const acc1 = ct.accent || '#c084fc';
            const acc2 = ct.accent2 || '#38bdf8';
            return {
              shooting: [
                { head: '#ffffff', mid: acc1, tail: 'rgba(255, 255, 255, 0)' },
                { head: '#ffffff', mid: acc2, tail: 'rgba(255, 255, 255, 0)' },
                { head: '#ffffff', mid: '#fef08a', tail: 'rgba(254, 240, 138, 0)' }
              ],
              stars: ['#ffffff', acc1, acc2, '#fef08a']
            };
          }
          case 'galaxy':
            return {
              shooting: [
                { head: '#ffffff', mid: '#38bdf8', tail: 'rgba(56, 189, 248, 0)' },
                { head: '#ffffff', mid: '#7dd3fc', tail: 'rgba(125, 211, 252, 0)' },
                { head: '#ffffff', mid: '#a5f3fc', tail: 'rgba(165, 243, 252, 0)' },
                { head: '#ffffff', mid: '#60a5fa', tail: 'rgba(96, 165, 250, 0)' }
              ],
              stars: ['#ffffff', '#38bdf8', '#7dd3fc', '#a5f3fc', '#93c5fd']
            };
          case 'aurora':
            return {
              shooting: [
                { head: '#ffffff', mid: '#34d399', tail: 'rgba(52, 211, 153, 0)' },
                { head: '#ffffff', mid: '#6ee7b7', tail: 'rgba(110, 231, 183, 0)' },
                { head: '#ffffff', mid: '#a7f3d0', tail: 'rgba(167, 243, 208, 0)' },
                { head: '#ffffff', mid: '#38bdf8', tail: 'rgba(56, 189, 248, 0)' }
              ],
              stars: ['#ffffff', '#34d399', '#6ee7b7', '#a7f3d0', '#7dd3fc']
            };
          case 'supernova':
            return {
              shooting: [
                { head: '#ffffff', mid: '#fb923c', tail: 'rgba(251, 146, 60, 0)' },
                { head: '#ffffff', mid: '#fdba74', tail: 'rgba(253, 186, 116, 0)' },
                { head: '#ffffff', mid: '#fef08a', tail: 'rgba(254, 240, 138, 0)' },
                { head: '#ffffff', mid: '#f87171', tail: 'rgba(248, 113, 113, 0)' }
              ],
              stars: ['#ffffff', '#fb923c', '#fdba74', '#fef08a', '#facc15']
            };
          case 'cosmos':
            return {
              shooting: [
                { head: '#ffffff', mid: '#fbbf24', tail: 'rgba(251, 191, 36, 0)' },
                { head: '#ffffff', mid: '#fcd34d', tail: 'rgba(252, 211, 77, 0)' },
                { head: '#ffffff', mid: '#fde68a', tail: 'rgba(253, 230, 138, 0)' },
                { head: '#ffffff', mid: '#fef08a', tail: 'rgba(254, 240, 138, 0)' }
              ],
              stars: ['#ffffff', '#fbbf24', '#fcd34d', '#fde68a', '#fef08a']
            };
          case 'vangogh':
            return {
              shooting: [
                { head: '#ffffff', mid: '#facc15', tail: 'rgba(250, 204, 21, 0)' },
                { head: '#ffffff', mid: '#fef08a', tail: 'rgba(254, 240, 138, 0)' },
                { head: '#ffffff', mid: '#38bdf8', tail: 'rgba(56, 189, 248, 0)' },
                { head: '#ffffff', mid: '#e0e7ff', tail: 'rgba(224, 231, 255, 0)' }
              ],
              stars: ['#ffffff', '#fef08a', '#facc15', '#38bdf8', '#e0e7ff']
            };
          case 'nebula':
          default:
            return {
              shooting: [
                { head: '#ffffff', mid: '#c084fc', tail: 'rgba(192, 132, 252, 0)' },
                { head: '#ffffff', mid: '#818cf8', tail: 'rgba(129, 140, 248, 0)' },
                { head: '#ffffff', mid: '#38bdf8', tail: 'rgba(56, 189, 248, 0)' },
                { head: '#ffffff', mid: '#e0e7ff', tail: 'rgba(224, 231, 255, 0)' }
              ],
              stars: ['#ffffff', '#c084fc', '#818cf8', '#38bdf8', '#e0e7ff']
            };
        }
      }

      // 160 Estrellas pequeñas y suaves
      const stars = Array.from({ length: 160 }, (_, idx) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.1 + 0.4,
        alpha: Math.random() * 0.35 + 0.08,
        speed: Math.random() * 0.012 + 0.004,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        colorIndex: idx
      }));

      // Throttling suave para el slider de Blur (Desenfoque de Cristal) sin lag
      let customBlurRaf = null;
      window.onCustomBlurSliderInput = function(val) {
        const display = document.getElementById('customBlurVal');
        if (display) display.textContent = val + 'px';

        if (customBlurRaf) cancelAnimationFrame(customBlurRaf);
        customBlurRaf = requestAnimationFrame(() => {
          if (typeof updateCustomThemeFromUI === 'function') {
            updateCustomThemeFromUI();
          }
        });
      };

      // Manejadores de Selección, Ajuste, Posición y Zoom del Fondo
      window.onCustomBgSelected = function(input) {
        if (!input || !input.files || !input.files[0]) return;
        const file = input.files[0];
        const filePath = file.path || URL.createObjectURL(file);
        window.setCustomBgMedia(filePath);
      };

      window.setCustomBgMedia = function(path) {
        localStorage.setItem('nebula_custom_bg_path', path || '');
        // Sincronizar con settings.customTheme.bgImage para persistencia entre sesiones
        if (typeof settings !== 'undefined' && settings) {
          if (!settings.customTheme) settings.customTheme = {};
          settings.customTheme.bgImage = path || null;
          if (typeof ipc !== 'undefined') ipc.send('save-settings', settings);
        }
        applyCustomBgMediaToDOM(path || '');
      };

      window.clearCustomBgImage = function() {
        localStorage.removeItem('nebula_custom_bg_path');
        if (typeof settings !== 'undefined' && settings) {
          if (!settings.customTheme) settings.customTheme = {};
          settings.customTheme.bgImage = null;
          if (typeof ipc !== 'undefined') ipc.send('save-settings', settings);
        }
        applyCustomBgMediaToDOM('');
      };

      function applyCustomBgMediaToDOM(path) {
        const imgEl = document.getElementById('custom-bg-img');
        const videoEl = document.getElementById('custom-bg-video');
        const bgDiv = document.getElementById('bg');
        const clearBtn = document.getElementById('clearBgBtn');
        const statusText = document.getElementById('customBgStatusText');

        const activeMedia = path || (typeof settings !== 'undefined' && settings.customTheme && settings.customTheme.bgImage) || '';

        if (!activeMedia || activeMedia.trim() === '') {
          if (imgEl) { imgEl.style.display = 'none'; imgEl.src = ''; }
          if (videoEl) { videoEl.style.display = 'none'; videoEl.pause(); videoEl.src = ''; }
          if (clearBtn) clearBtn.style.display = 'none';
          if (statusText) statusText.textContent = 'Sin imagen personalizada';
          if (bgDiv) bgDiv.style.backgroundImage = '';
          return;
        }

        if (bgDiv) bgDiv.style.backgroundImage = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-block';
        if (statusText) statusText.textContent = 'Fondo personalizado activo';

        const fit = localStorage.getItem('nebula_custom_bg_fit') || 'cover';
        const pos = localStorage.getItem('nebula_custom_bg_pos') || 'center center';
        const zoom = localStorage.getItem('nebula_custom_bg_zoom') || '100';

        let fileUrl = activeMedia;
        if (!activeMedia.startsWith('file://') && !activeMedia.startsWith('http://') && !activeMedia.startsWith('https://') && !activeMedia.startsWith('blob:') && !activeMedia.startsWith('data:')) {
          fileUrl = 'file:///' + activeMedia.replace(/\\/g, '/');
        }

        const scale = (parseFloat(zoom || 100) / 100).toFixed(2);
        const transformStyle = `translateZ(0) scale(${scale})`;

        const isVideo = activeMedia.startsWith('data:video') || ['mp4', 'webm', 'mkv', 'mov'].some(ext => activeMedia.toLowerCase().split('?')[0].endsWith('.' + ext));

        if (isVideo) {
          if (imgEl) { imgEl.style.display = 'none'; imgEl.src = ''; }
          if (videoEl) {
            if (videoEl.src !== fileUrl) videoEl.src = fileUrl;
            videoEl.style.display = 'block';
            videoEl.style.objectFit = fit;
            videoEl.style.objectPosition = pos;
            videoEl.style.transform = transformStyle;
            videoEl.play().catch(e => console.warn(e));
          }
        } else {
          if (videoEl) { videoEl.style.display = 'none'; videoEl.pause(); videoEl.src = ''; }
          if (imgEl) {
            if (imgEl.src !== fileUrl) imgEl.src = fileUrl;
            imgEl.style.display = 'block';
            imgEl.style.objectFit = fit;
            imgEl.style.objectPosition = pos;
            imgEl.style.transform = transformStyle;
          }
        }
      }

      window.updateCustomBgStyleUI = function() {
        const fitSelect = document.getElementById('customBgFitSelect');
        const posSelect = document.getElementById('customBgPosSelect');
        const zoomSlider = document.getElementById('customBgZoomSlider');

        const fit = fitSelect ? fitSelect.value : 'cover';
        const pos = posSelect ? posSelect.value : 'center center';
        const zoom = zoomSlider ? zoomSlider.value : '100';

        localStorage.setItem('nebula_custom_bg_fit', fit);
        localStorage.setItem('nebula_custom_bg_pos', pos);

        applyCustomBgStyleToDOM(fit, pos, zoom);
      };

      window.updateCustomBgZoomUI = function(val) {
        const zoomValEl = document.getElementById('customBgZoomVal');
        if (zoomValEl) zoomValEl.textContent = val + '%';
        localStorage.setItem('nebula_custom_bg_zoom', val);

        const fitSelect = document.getElementById('customBgFitSelect');
        const posSelect = document.getElementById('customBgPosSelect');
        const fit = fitSelect ? fitSelect.value : 'cover';
        const pos = posSelect ? posSelect.value : 'center center';

        applyCustomBgStyleToDOM(fit, pos, val);
      };

      function applyCustomBgStyleToDOM(fit, pos, zoom) {
        const scale = (parseFloat(zoom || 100) / 100).toFixed(2);
        const transformStyle = `translateZ(0) scale(${scale})`;

        const targets = [
          document.getElementById('custom-bg-img'),
          document.getElementById('custom-bg-video')
        ];

        targets.forEach(el => {
          if (!el) return;
          el.style.objectFit = fit;
          el.style.objectPosition = pos;
          el.style.transform = transformStyle;
          el.style.willChange = 'transform';
          el.style.backfaceVisibility = 'hidden';
        });
      }

      document.addEventListener('DOMContentLoaded', () => {
        const savedFit = localStorage.getItem('nebula_custom_bg_fit') || 'cover';
        const savedPos = localStorage.getItem('nebula_custom_bg_pos') || 'center center';
        const savedZoom = localStorage.getItem('nebula_custom_bg_zoom') || '100';

        const fitSelect = document.getElementById('customBgFitSelect');
        const posSelect = document.getElementById('customBgPosSelect');
        const zoomSlider = document.getElementById('customBgZoomSlider');
        const zoomValEl = document.getElementById('customBgZoomVal');

        if (fitSelect) fitSelect.value = savedFit;
        if (posSelect) posSelect.value = savedPos;
        if (zoomSlider) zoomSlider.value = savedZoom;
        if (zoomValEl) zoomValEl.textContent = savedZoom + '%';

        // Aplicar el fondo multimedia guardado para que la pantalla de login
        // también muestre el mismo fondo personalizado del launcher.
        const savedPath = localStorage.getItem('nebula_custom_bg_path') || '';
        if (savedPath) applyCustomBgMediaToDOM(savedPath);
        else applyCustomBgStyleToDOM(savedFit, savedPos, savedZoom);

        // Aplicar el tema de colores guardado desde localStorage para que
        // la pantalla de login tenga los mismos colores personalizados.
        const savedTheme = localStorage.getItem('nebula_saved_theme') || '';
        if (savedTheme === 'custom') {
          document.documentElement.setAttribute('data-theme', 'custom');
          // Aplicar colores personalizados desde localStorage
          const savedAccent = localStorage.getItem('nebula_custom_accent') || '';
          const savedAccent2 = localStorage.getItem('nebula_custom_accent2') || '';
          const savedOrb1 = localStorage.getItem('nebula_custom_orb1') || '';
          const savedOrb2 = localStorage.getItem('nebula_custom_orb2') || '';
          if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
          if (savedAccent2) document.documentElement.style.setProperty('--accent2', savedAccent2);
          if (savedOrb1) document.documentElement.style.setProperty('--orb1', savedOrb1);
          if (savedOrb2) document.documentElement.style.setProperty('--orb2', savedOrb2);
        } else if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      });

      // Estrellas fugaces espectaculares y vivas con corrección de minimizado
      const shootingStars = [];
      let isCanvasWindowMinimized = false;

      function checkIsWindowMinimized() {
        return document.hidden || isCanvasWindowMinimized;
      }

      function resetCanvasShootingStars() {
        shootingStars.length = 0; // Vaciar cola acumulada al minimizarse o restaurarse
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          isCanvasWindowMinimized = true;
          resetCanvasShootingStars();
        } else {
          isCanvasWindowMinimized = false;
          resetCanvasShootingStars();
        }
      });

      window.addEventListener('blur', () => {
        isCanvasWindowMinimized = true;
        resetCanvasShootingStars();
      });

      window.addEventListener('focus', () => {
        isCanvasWindowMinimized = false;
        resetCanvasShootingStars();
      });

      try {
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('window-minimize', () => {
          isCanvasWindowMinimized = true;
          resetCanvasShootingStars();
        });
        ipcRenderer.on('window-restore', () => {
          isCanvasWindowMinimized = false;
          resetCanvasShootingStars();
        });
      } catch(e) {}

      function spawnShootingStar() {
        if (checkIsWindowMinimized()) return; // No generar estrellas en segundo plano
        if (shootingStars.length >= 6) return; // Limitar a máximo 6 simultáneas

        const fromRight = Math.random() > 0.25;
        const angle = fromRight 
          ? Math.PI * 0.72 + (Math.random() - 0.5) * 0.25
          : Math.PI * 0.28 + (Math.random() - 0.5) * 0.25;

        const startX = fromRight 
          ? Math.random() * (width * 0.8) + width * 0.35 
          : Math.random() * (width * 0.4);
        const startY = Math.random() * (height * 0.45);

        const themeConfig = getThemeColors();
        const colors = themeConfig.shooting;
        const color = colors[Math.floor(Math.random() * colors.length)];

        shootingStars.push({
          x: startX,
          y: startY,
          length: Math.random() * 150 + 110,
          speed: Math.random() * 16 + 12,
          size: Math.random() * 1.8 + 1.2,
          alpha: 1.0,
          angle: angle,
          color: color,
          particles: []
        });
      }

      function scheduleNextShootingStar() {
        if (!checkIsWindowMinimized()) {
          spawnShootingStar();
          if (Math.random() < 0.4) {
            setTimeout(() => { if (!checkIsWindowMinimized()) spawnShootingStar(); }, 150 + Math.random() * 250);
          }
        }
        setTimeout(scheduleNextShootingStar, 800 + Math.random() * 900);
      }
      scheduleNextShootingStar();

      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / width - 0.5) * 12;
        mouseY = (e.clientY / height - 0.5) * 12;
      });

      let time = 0;
      let lastFrameTime = performance.now();

      function render(now) {
        requestAnimationFrame(render);

        if (checkIsWindowMinimized()) return;

        const currentNow = now || performance.now();
        const delta = Math.min(currentNow - lastFrameTime, 100);
        lastFrameTime = currentNow;
        const deltaFactor = delta / 16.666; // Compensación delta-time para velocidad constante a 60 FPS

        ctx.clearRect(0, 0, width, height);
        time += 0.01 * deltaFactor;

        const themeConfig = getThemeColors();
        const starColors = themeConfig.stars;

        // Renderizar Estrellas parpadeantes
        for (let s of stars) {
          s.alpha += s.speed * s.twinkleDir * deltaFactor;
          if (s.alpha >= 0.45) { s.alpha = 0.45; s.twinkleDir = -1; }
          else if (s.alpha <= 0.08) { s.alpha = 0.08; s.twinkleDir = 1; }

          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = starColors[s.colorIndex % starColors.length];
          ctx.beginPath();
          ctx.arc(s.x + mouseX * (s.size * 0.2), s.y + mouseY * (s.size * 0.2), s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Renderizar Estrellas Fugaces independientes de caídas de FPS
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          let st = shootingStars[i];

          const dx = Math.cos(st.angle) * st.speed * deltaFactor;
          const dy = Math.sin(st.angle) * st.speed * deltaFactor;

          st.x += dx;
          st.y += dy;
          st.alpha -= 0.012 * deltaFactor;

          if (Math.random() < 0.65 * deltaFactor) {
            st.particles.push({
              x: st.x + (Math.random() - 0.5) * 4,
              y: st.y + (Math.random() - 0.5) * 4,
              size: Math.random() * 1.6 + 0.6,
              alpha: st.alpha * 0.85,
              color: st.color.mid
            });
          }

          for (let pIdx = st.particles.length - 1; pIdx >= 0; pIdx--) {
            let p = st.particles[pIdx];
            p.alpha -= 0.035 * deltaFactor;
            if (p.alpha <= 0) {
              st.particles.splice(pIdx, 1);
              continue;
            }
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (st.alpha <= 0 || st.x < -250 || st.x > width + 250 || st.y > height + 250) {
            shootingStars.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, st.alpha);

          const tailLen = st.length;
          const tailX = st.x - Math.cos(st.angle) * tailLen;
          const tailY = st.y - Math.sin(st.angle) * tailLen;

          const gradient = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
          gradient.addColorStop(0, st.color.head);
          gradient.addColorStop(0.2, st.color.mid);
          gradient.addColorStop(1, st.color.tail);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = st.size;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(st.x, st.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Resplandor optimizado de la cabeza (sin ralentizar con shadowBlur)
          ctx.fillStyle = st.color.mid;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.size * 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = st.color.head;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.size * 1.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      requestAnimationFrame(render);
    })();
  