/* Nebula Dev Studios — aviso de privacidad y preferencias de consentimiento.
 *
 * El consentimiento de anuncios y tecnologías de terceros lo recoge el CMP
 * certificado de Google (AdSense > Privacidad y mensajes), que se sirve con la
 * etiqueta de AdSense ya instalada en el sitio. Este script NO recoge ni simula
 * consentimiento. Se limita a:
 *   1. mantener el aviso informativo propio donde el CMP de Google no muestra
 *      ningún mensaje;
 *   2. evitar que el aviso propio y el mensaje de Google se solapen;
 *   3. ofrecer un acceso real para revisar o retirar la decisión de
 *      consentimiento (googlefc.showRevocationMessage) cuando las normas de
 *      la UE se aplican al visitante.
 *
 * El espacio de nombres googlefc lo crea siempre el CMP de Google. Aquí solo se
 * consulta cuando ya existe, para no interferir con su propia inicialización.
 *
 * Referencia de la API: https://developers.google.com/funding-choices/fc-api-docs
 */
(function () {
  'use strict';

  var LABELS = {
    es: { settings: 'Preferencias de privacidad' },
    en: { settings: 'Privacy preferences' },
    pt: { settings: 'Preferências de privacidade' }
  };

  var DISMISS_KEY = 'nebula_cookie_notice_dismissed';
  var REGION_TIMEOUT_MS = 2000;
  var POLL_MS = 100;

  var lang = 'es';

  /* ── Estado de la región ─────────────────────────────────────────────── */
  var euApplies = false;
  var usApplies = false;
  var regionSettled = false;
  var injectedLabels = [];

  function resolveLanguage() {
    var raw = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
    lang = raw.indexOf('pt') === 0 ? 'pt' : raw.indexOf('en') === 0 ? 'en' : 'es';
  }

  function settingsLabel() {
    return (LABELS[lang] || LABELS.es).settings;
  }

  /* ── Acceso a la cola de mensajes del CMP de Google ──────────────────── */
  function consentQueue() {
    if (!window.googlefc || typeof window.googlefc !== 'object') return null;
    var queue = window.googlefc.callbackQueue;
    if (queue && typeof queue.push === 'function') return queue;
    /* El espacio de nombres ya existe, así que el CMP de Google está activo:
       preparamos la cola en espera tal como documenta la API. */
    if (queue === undefined) {
      window.googlefc.callbackQueue = [];
      return window.googlefc.callbackQueue;
    }
    return null;
  }

  /* Espera a que el CMP esté disponible sin crearlo: en las páginas donde no
     se sirve ningún mensaje, googlefc nunca aparece y no hacemos nada. */
  function onConsentQueue(register) {
    var waited = 0;
    (function attempt() {
      var queue = consentQueue();
      if (queue) {
        register(queue);
        return;
      }
      waited += POLL_MS;
      if (waited >= REGION_TIMEOUT_MS) return;
      window.setTimeout(attempt, POLL_MS);
    })();
  }

  function whenConsentApi(callback) {
    onConsentQueue(function (queue) {
      queue.push({ 'CONSENT_API_READY': callback });
    });
  }

  /* ── Aviso informativo propio ────────────────────────────────────────── */
  function getBanner() {
    return document.getElementById('cookieConsentBanner');
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.style.opacity = '0';
    window.setTimeout(function () {
      banner.style.display = 'none';
    }, 300);
  }

  function applyNoticeVisibility() {
    var banner = getBanner();
    if (!banner) return;
    /* Si el CMP de Google se ocupa del consentimiento en esta región, no
       mostramos un segundo aviso. */
    var suppressed = euApplies || usApplies;
    if (suppressed || localStorage.getItem(DISMISS_KEY) === 'true') {
      banner.style.display = 'none';
      return;
    }
    banner.style.display = 'block';
  }

  function applySettingsVisibility() {
    injectedLabels.forEach(function (element) {
      element.style.display = euApplies ? '' : 'none';
    });
  }

  function settleRegion() {
    regionSettled = true;
    applyNoticeVisibility();
    applySettingsVisibility();
  }

  onConsentQueue(function (queue) {
    /* Normas de la UE: el CMP expone gdprApplies mediante el API TCF v2. */
    queue.push({
      'CONSENT_API_READY': function () {
        if (typeof window.__tcfapi !== 'function') return;
        window.__tcfapi('addEventListener', 0, function (tcdata, success) {
          if (!success || !tcdata || typeof tcdata.gdprApplies !== 'boolean') return;
          euApplies = tcdata.gdprApplies;
          settleRegion();
        });
      }
    });

    /* Regulaciones de estados de EE. UU.: el CMP muestra su propio enlace de
       exclusión, así que tampoco añadimos el aviso informativo. */
    queue.push({
      'INITIAL_US_STATES_OPT_OUT_DATA_READY': function () {
        var api = window.googlefc.usstatesoptout;
        if (!api || typeof api.getInitialUsStatesOptOutStatus !== 'function') return;
        var states = api.InitialUsStatesOptOutStatusEnum || {};
        usApplies = api.getInitialUsStatesOptOutStatus() !== states.DOES_NOT_APPLY;
        settleRegion();
      }
    });
  });

  /* Si el CMP no responde (por ejemplo, en páginas sin mensaje configurado),
     mantenemos el comportamiento anterior: aviso informativo visible. */
  window.setTimeout(function () {
    if (regionSettled) return;
    euApplies = false;
    usApplies = false;
    settleRegion();
  }, REGION_TIMEOUT_MS);

  /* ── Preferencias de privacidad (revocación) ─────────────────────────── */
  function openPrivacySettings() {
    if (!euApplies) return;
    var queue = consentQueue();
    if (!queue) return;
    queue.push({
      'CONSENT_API_READY': function () {
        if (typeof window.googlefc.showRevocationMessage === 'function') {
          window.googlefc.showRevocationMessage();
        }
      }
    });
  }

  function buildSettingsButton() {
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-consent-settings', '');
    button.textContent = settingsLabel();
    button.style.cssText = [
      'background:transparent',
      'border:1px solid rgba(255,255,255,0.25)',
      'color:#c7bfe0',
      'border-radius:10px',
      'padding:10px 18px',
      'font-family:inherit',
      'font-size:0.86rem',
      'font-weight:600',
      'cursor:pointer',
      'display:none'
    ].join(';');
    button.addEventListener('click', openPrivacySettings);
    injectedLabels.push(button);
    return button;
  }

  function mountSettingsAccess() {
    /* Contenedor propio (por ejemplo, en la página de privacidad). */
    var slot = document.getElementById('consentSettingsSlot');
    if (slot && !slot.querySelector('[data-consent-settings]')) {
      slot.appendChild(buildSettingsButton());
    }

    /* Acceso en el propio aviso, mientras está visible. */
    var banner = getBanner();
    if (banner) {
      var holder = banner.querySelector('.cookie-buttons') || banner.querySelector('.cookie-content');
      if (holder && !holder.querySelector('[data-consent-settings]')) {
        holder.appendChild(buildSettingsButton());
      }
    }

    /* Cualquier elemento ya presente en el HTML. */
    Array.prototype.forEach.call(document.querySelectorAll('[data-consent-settings]'), function (element) {
      if (injectedLabels.indexOf(element) === -1) {
        injectedLabels.push(element);
        element.addEventListener('click', openPrivacySettings);
      }
    });

    applySettingsVisibility();
  }

  /* ── Compatibilidad con el marcado existente ─────────────────────────── */
  window.initCookieConsent = function initCookieConsent() {
    applyNoticeVisibility();
  };

  window.dismissCookieBanner = function dismissCookieBanner() {
    localStorage.setItem(DISMISS_KEY, 'true');
    hideBanner(getBanner());
  };

  window.openNebulaPrivacySettings = openPrivacySettings;

  /* ── Arranque ────────────────────────────────────────────────────────── */
  function start() {
    resolveLanguage();
    mountSettingsAccess();

    /* El selector de idioma del sitio cambia <html lang>; actualizamos las
       etiquetas que hemos inyectado para que sigan el idioma elegido. */
    if (window.MutationObserver) {
      new MutationObserver(function () {
        resolveLanguage();
        injectedLabels.forEach(function (element) {
          element.textContent = settingsLabel();
        });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
