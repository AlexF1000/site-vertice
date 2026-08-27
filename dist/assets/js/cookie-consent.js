/**
 * VÉRTICE SOCIAL MÍDIA — COOKIE CONSENT & LGPD SYSTEM
 * Structured according to Antigravity Master Config (ID: vertice-cookie-consent)
 */

(function () {
  'use strict';

  const CONFIG = {
    id: "vertice-cookie-consent",
    storageKey: "vertice_cookie_preferences",
    expirationDays: 180,
    theme: {
      bgColor: "#0f172a",
      textColor: "#f8fafc",
      accentColor: "#d4af37",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)"
    },
    categories: [
      {
        id: "essential",
        name: "Cookies Estritamente Necessários",
        description: "Fundamentais para o funcionamento básico, navegação segura e integridade do site.",
        required: true,
        defaultState: true,
        editable: false
      },
      {
        id: "analytics",
        name: "Cookies de Análise e Métricas",
        description: "Ajudam a entender o comportamento dos visitantes e medir a performance das páginas.",
        required: false,
        defaultState: false,
        editable: true
      },
      {
        id: "marketing",
        name: "Cookies de Marketing e Remarketing",
        description: "Utilizados para rastrear conversões e exibir anúncios segmentados no Google e Meta.",
        required: false,
        defaultState: false,
        editable: true
      }
    ]
  };

  // Helper to determine relative link to privacy policy
  function getPrivacyPolicyUrl() {
    const path = window.location.pathname;
    if (path.includes('/blog/') || 
        path.includes('/trafego-pago/') || 
        path.includes('/criacao-de-sites/') || 
        path.includes('/automacoes-ia/') || 
        path.includes('/media-social/') || 
        path.includes('/seo-copy/') || 
        path.includes('/identidade-visual/') || 
        path.includes('/politica-de-privacidade/')) {
      return "../politica-de-privacidade/";
    }
    return "./politica-de-privacidade/";
  }

  // Read stored preferences with 180 days expiration check
  function getStoredPreferences() {
    try {
      const data = localStorage.getItem(CONFIG.storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.timestamp) return null;

      const maxAgeMs = CONFIG.expirationDays * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > maxAgeMs) {
        localStorage.removeItem(CONFIG.storageKey);
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn('[Cookie Consent] Error reading localStorage', e);
      return null;
    }
  }

  // Save preferences and apply consent
  function savePreferences(preferences) {
    const record = {
      essential: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      timestamp: Date.now(),
      version: "1.0"
    };

    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(record));
    } catch (e) {
      console.warn('[Cookie Consent] Error saving to localStorage', e);
    }

    applyConsent(record);
    closeBanner();
    closeModal();
    return record;
  }

  // Apply consent updates to Google Analytics (gtag) and Meta Pixel
  function applyConsent(prefs) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
        'ad_storage': prefs.marketing ? 'granted' : 'denied',
        'ad_user_data': prefs.marketing ? 'granted' : 'denied',
        'ad_personalization': prefs.marketing ? 'granted' : 'denied'
      });
    }

    // Dispatch global custom event for any analytics tracking
    window.dispatchEvent(new CustomEvent('vertice_cookie_consent_updated', {
      detail: prefs
    }));
  }

  // Injects scoped styles for banner and modal
  function injectStyles() {
    if (document.getElementById('vertice-cookie-styles')) return;
    const style = document.createElement('style');
    style.id = 'vertice-cookie-styles';
    style.textContent = `
      #vertice-cookie-consent-banner {
        position: fixed;
        bottom: 1.25rem;
        left: 1rem;
        right: 1rem;
        max-width: 76rem;
        margin: 0 auto;
        z-index: 9999;
        background-color: ${CONFIG.theme.bgColor};
        color: ${CONFIG.theme.textColor};
        border-radius: ${CONFIG.theme.borderRadius};
        box-shadow: ${CONFIG.theme.boxShadow}, 0 0 25px rgba(212, 175, 55, 0.15);
        border: 1px solid rgba(212, 175, 55, 0.3);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        animation: verticeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      #vertice-cookie-consent-banner.closing {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }
      @keyframes verticeSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .vertice-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      .vertice-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .vertice-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #334155;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .vertice-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 2px;
        bottom: 2px;
        background-color: #f8fafc;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      .vertice-switch input:checked + .vertice-slider {
        background: linear-gradient(135deg, #d4af37, #a27a1a);
        border-color: rgba(212, 175, 55, 0.5);
      }
      .vertice-switch input:checked + .vertice-slider:before {
        transform: translateX(20px);
        background-color: #080c14;
      }
      .vertice-switch input:disabled + .vertice-slider {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // Render bottom-fixed banner
  function renderBanner() {
    if (document.getElementById('vertice-cookie-consent-banner')) return;

    injectStyles();

    const banner = document.createElement('aside');
    banner.id = 'vertice-cookie-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Consentimento de Cookies e Privacidade');

    const privacyUrl = getPrivacyPolicyUrl();

    banner.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
        <!-- Text & Info -->
        <div class="flex items-start gap-3.5 sm:gap-4 max-w-4xl">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-amber-400 shadow-lg shadow-amber-950/40">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div class="space-y-1.5">
            <h3 class="font-heading font-bold text-white text-base sm:text-lg flex items-center gap-2">
              Sua privacidade é importante para nós
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">LGPD</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Utilizamos cookies e tecnologias semelhantes para aprimorar sua experiência, analisar o tráfego e personalizar conteúdos e anúncios, em conformidade com a LGPD.
              <a href="${privacyUrl}" class="text-amber-400 hover:text-amber-300 underline font-medium ml-1 transition-colors">
                Política de Privacidade (LGPD)
              </a>
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto flex-shrink-0 justify-end">
          <button type="button" id="vertice-cookie-customize-btn" class="px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all text-center flex-1 sm:flex-initial">
            Personalizar
          </button>
          <button type="button" id="vertice-cookie-reject-btn" class="px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-300 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 transition-all text-center flex-1 sm:flex-initial">
            Recusar Não Essenciais
          </button>
          <button type="button" id="vertice-cookie-accept-all-btn" class="btn-gold px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all text-center flex-1 sm:flex-initial">
            Aceitar Todos
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Bind action listeners
    const acceptAllBtn = document.getElementById('vertice-cookie-accept-all-btn');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        savePreferences({ essential: true, analytics: true, marketing: true });
      });
    }

    const rejectBtn = document.getElementById('vertice-cookie-reject-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        savePreferences({ essential: true, analytics: false, marketing: false });
      });
    }

    const customizeBtn = document.getElementById('vertice-cookie-customize-btn');
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        openModal();
      });
    }
  }

  // Smooth banner dismissal
  function closeBanner() {
    const banner = document.getElementById('vertice-cookie-consent-banner');
    if (banner) {
      banner.classList.add('closing');
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    }
  }

  // Render modal dialog for category customization
  function renderModal() {
    if (document.getElementById('vertice-cookie-modal-container')) return;

    injectStyles();

    const currentPrefs = getStoredPreferences() || { essential: true, analytics: false, marketing: false };
    const privacyUrl = getPrivacyPolicyUrl();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'vertice-cookie-modal-container';
    modalContainer.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300';
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    modalContainer.setAttribute('aria-labelledby', 'vertice-cookie-modal-title');

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-xl bg-[#0f172a] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-left transform transition-all duration-300 max-h-[90vh] flex flex-col">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-5 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="vertice-cookie-modal-title" class="font-heading font-bold text-white text-lg sm:text-xl">Preferências de Cookies</h2>
              <p class="text-xs text-slate-400">Personalize as categorias de dados que você autoriza</p>
            </div>
          </div>
          <button type="button" id="vertice-cookie-modal-close-x" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors" aria-label="Fechar modal">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body: Categories -->
        <div class="py-5 space-y-4 overflow-y-auto pr-1 flex-1">
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Em conformidade com a LGPD (Lei nº 13.709/2018), você possui total controle sobre quais dados são coletados durante a sua navegação.
          </p>

          <!-- Category: Essential -->
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">Cookies Estritamente Necessários</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Obrigatório</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Fundamentais para o funcionamento básico, navegação segura e integridade do site.
              </p>
            </div>
            <div class="flex-shrink-0 pt-1">
              <label class="vertice-switch" title="Necessário para o funcionamento do site">
                <input type="checkbox" checked disabled>
                <span class="vertice-slider"></span>
              </label>
            </div>
          </div>

          <!-- Category: Analytics -->
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">Cookies de Análise e Métricas</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">Opcional</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Ajudam a entender o comportamento dos visitantes e medir a performance das páginas.
              </p>
            </div>
            <div class="flex-shrink-0 pt-1">
              <label class="vertice-switch" for="vertice-toggle-analytics" title="Ativar ou desativar cookies analíticos">
                <input type="checkbox" id="vertice-toggle-analytics" ${currentPrefs.analytics ? 'checked' : ''}>
                <span class="vertice-slider"></span>
              </label>
            </div>
          </div>

          <!-- Category: Marketing -->
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">Cookies de Marketing e Remarketing</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">Opcional</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Utilizados para rastrear conversões e exibir anúncios segmentados no Google e Meta.
              </p>
            </div>
            <div class="flex-shrink-0 pt-1">
              <label class="vertice-switch" for="vertice-toggle-marketing" title="Ativar ou desativar cookies de marketing">
                <input type="checkbox" id="vertice-toggle-marketing" ${currentPrefs.marketing ? 'checked' : ''}>
                <span class="vertice-slider"></span>
              </label>
            </div>
          </div>

          <div class="pt-2 text-center sm:text-left">
            <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-400 hover:text-amber-300 underline transition-colors">
              Ler nossa Política de Privacidade Completa (LGPD) →
            </a>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-5 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button type="button" id="vertice-modal-save-custom-btn" class="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-center">
            Salvar Preferências
          </button>
          <button type="button" id="vertice-modal-accept-all-btn" class="w-full sm:w-auto btn-gold px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all text-center">
            Aceitar Todos
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modalContainer);

    // Modal listeners
    const closeBtn = document.getElementById('vertice-cookie-modal-close-x');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });

    const modalAcceptAll = document.getElementById('vertice-modal-accept-all-btn');
    if (modalAcceptAll) {
      modalAcceptAll.addEventListener('click', () => {
        savePreferences({ essential: true, analytics: true, marketing: true });
      });
    }

    const modalSaveCustom = document.getElementById('vertice-modal-save-custom-btn');
    if (modalSaveCustom) {
      modalSaveCustom.addEventListener('click', () => {
        const analyticsEl = document.getElementById('vertice-toggle-analytics');
        const marketingEl = document.getElementById('vertice-toggle-marketing');
        savePreferences({
          essential: true,
          analytics: analyticsEl ? analyticsEl.checked : false,
          marketing: marketingEl ? marketingEl.checked : false
        });
      });
    }
  }

  function openModal() {
    renderModal();
    const modal = document.getElementById('vertice-cookie-modal-container');
    if (modal) {
      modal.style.display = 'flex';
      modal.style.opacity = '1';
    }
  }

  function closeModal() {
    const modal = document.getElementById('vertice-cookie-modal-container');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 300);
    }
  }

  // System Initialization
  function init() {
    const saved = getStoredPreferences();
    if (!saved) {
      renderBanner();
    } else {
      applyConsent(saved);
    }

    // Listen for any manual triggers to open cookie modal
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-cookie-settings], a[href="#gerenciar-cookies"], a[href="#cookies-config"]');
      if (trigger) {
        e.preventDefault();
        openModal();
      }
    });
  }

  // Expose global public API
  window.VerticeCookieConsent = {
    openModal: openModal,
    closeModal: closeModal,
    acceptAll: function () { return savePreferences({ essential: true, analytics: true, marketing: true }); },
    rejectOptional: function () { return savePreferences({ essential: true, analytics: false, marketing: false }); },
    getPreferences: getStoredPreferences,
    resetConsent: function () {
      localStorage.removeItem(CONFIG.storageKey);
      renderBanner();
    }
  };

  window.openVerticeCookieSettings = openModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
