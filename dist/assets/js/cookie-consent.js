/**
 * VÉRTICE SOCIAL MÍDIA — SISTEMA DE CONSENTIMENTO DE COOKIES (LGPD)
 * Implementação 100% nativa em JavaScript/CSS puro, sem dependências externas.
 * Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'vertice_cookie_consent';
  const LEGACY_KEY = 'vertice_cookie_preferences';
  const EXPIRATION_DAYS = 180;

  // Determina o link correto para a política de privacidade baseado no idioma da URL
  function getPrivacyPolicyUrl() {
    const pathname = window.location.pathname;
    if (pathname.includes('/pt/') || document.documentElement.lang.startsWith('pt')) {
      return '/pt/politica-de-privacidade/#cookies';
    }
    return '/politica-de-privacidade/#cookies';
  }

  // Traduções do sistema de consentimento (Espanhol e Português)
  function getI18n() {
    const lang = (document.documentElement.lang || 'es').toLowerCase();
    const isEs = lang.startsWith('es');
    if (isEs) {
      return {
        bannerAria: 'Consentimiento de Cookies y Privacidad',
        bannerTitle: 'Privacidad y Preferencias de Cookies',
        bannerBadge: 'Privacidad',
        bannerText: 'Utilizamos cookies para optimizar tu navegación, medir audiencia (<strong class="text-slate-200">Google Analytics</strong>) y personalizar contenidos y anuncios (<strong class="text-slate-200">Meta Pixel / Google Ads</strong>), garantizando la protección de tus datos. Puedes personalizar tus preferencias en cualquier momento.',
        bannerPolicyLink: 'Más información en la Política de Privacidad',
        btnCustomize: 'Personalizar',
        btnReject: 'Rechazar No Esenciales',
        btnAcceptAll: 'Aceptar Todos',
        modalTitle: 'Preferencias de Cookies',
        modalSubtitle: 'Gestiona tus opciones de privacidad y consentimiento',
        modalIntro: 'Tienes total control para autorizar o revocar el almacenamiento de cookies en tu dispositivo en cualquier momento.',
        essentialTitle: 'Cookies Estrictamente Necesarias',
        alwaysActive: 'Siempre Activo',
        essentialDesc: 'Esenciales para el funcionamiento seguro del sitio web, carga de tipografías, integridad de la sesión y protección. No se pueden desactivar.',
        analyticsTitle: 'Cookies de Análisis y Métricas',
        optional: 'Opcional',
        analyticsDesc: 'Utilizadas a través de <strong class="text-slate-300">Google Analytics</strong> para medir estadísticas de visitas, velocidad y páginas más consultadas de forma 100% anonimizada.',
        marketingTitle: 'Cookies de Marketing y Conversión',
        marketingDesc: 'Empleadas por <strong class="text-slate-300">Meta Pixel</strong> y <strong class="text-slate-300">Google Ads</strong> para medir conversiones y mostrar anuncios relevantes para quienes demostraron interés en nuestros servicios.',
        fullPolicyLink: 'Leer nuestra Política de Privacidad Completa →',
        btnSaveCustom: 'Guardar Preferencias'
      };
    }
    return {
      bannerAria: 'Consentimento de Cookies e Privacidade',
      bannerTitle: 'Privacidade e Preferências de Cookies',
      bannerBadge: 'LGPD',
      bannerText: 'Utilizamos cookies para aprimorar sua navegação, mensurar audiência (<strong class="text-slate-200">Google Analytics</strong>) e personalizar conteúdos e anúncios (<strong class="text-slate-200">Meta Pixel / Google Ads</strong>), em conformidade com a LGPD. Você pode personalizar suas escolhas a qualquer momento.',
      bannerPolicyLink: 'Saiba mais na Política de Privacidade',
      btnCustomize: 'Personalizar',
      btnReject: 'Rejeitar Não Essenciais',
      btnAcceptAll: 'Aceitar Todos',
      modalTitle: 'Preferências de Cookies',
      modalSubtitle: 'Gerencie suas escolhas de privacidade e consentimento (LGPD)',
      modalIntro: 'De acordo com o Art. 18 da LGPD, você possui total controle para autorizar ou recusar o armazenamento de cookies no seu dispositivo a qualquer momento.',
      essentialTitle: 'Cookies Estritamente Necessários',
      alwaysActive: 'Sempre Ativo',
      essentialDesc: 'Essenciais para o funcionamento seguro do site, carregamento de fontes, integridade da sessão e proteção contra ataques. Não podem ser desativados.',
      analyticsTitle: 'Cookies de Análise e Métricas',
      optional: 'Opcional',
      analyticsDesc: 'Utilizados através do <strong class="text-slate-300">Google Analytics</strong> para medir estatísticas de visitação, velocidade e páginas mais acessadas de forma 100% anonimizada.',
      marketingTitle: 'Cookies de Marketing e Remarketing',
      marketingDesc: 'Empregados pelo <strong class="text-slate-300">Meta Pixel</strong> e <strong class="text-slate-300">Google Ads</strong> para mensurar conversões e exibir anúncios segmentados para quem demonstrou interesse em nossos serviços.',
      fullPolicyLink: 'Ler nossa Política de Privacidade Completa (LGPD) →',
      btnSaveCustom: 'Salvar Preferências'
    };
  }

  // Lê preferências armazenadas no localStorage com validação de expiração
  function getStoredConsent() {
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        data = localStorage.getItem(LEGACY_KEY);
      }
      if (!data) return null;

      const parsed = JSON.parse(data);
      if (!parsed || !parsed.timestamp) return null;

      const consentTime = new Date(parsed.timestamp).getTime();
      const maxAgeMs = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      
      if (isNaN(consentTime) || (Date.now() - consentTime > maxAgeMs)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_KEY);
        return null;
      }

      return {
        essential: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        timestamp: parsed.timestamp,
        version: '1.0'
      };
    } catch (e) {
      console.warn('[Vértice LGPD] Erro ao ler preferências de cookies:', e);
      return null;
    }
  }

  // Salva preferências e dispara atualizações de consentimento
  function saveConsent(preferences) {
    const record = {
      essential: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('[Vértice LGPD] Erro ao salvar preferências no localStorage:', e);
    }

    applyConsent(record);
    closeBanner();
    closeModal();
    return record;
  }

  // Aplica o consentimento para Google Analytics, Meta Pixel e eventos DOM
  function applyConsent(consent) {
    // 1. Google Analytics Consent Mode v2
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied'
      });
    }

    // 2. Meta Pixel Consent Mode
    if (typeof window.fbq === 'function') {
      if (consent.marketing) {
        window.fbq('consent', 'grant');
      } else {
        window.fbq('consent', 'revoke');
      }
    }

    // 3. Disparo de eventos customizados para scripts terceiros
    window.dispatchEvent(new CustomEvent('vertice_cookie_consent_updated', {
      detail: consent
    }));

    if (consent.analytics) {
      window.dispatchEvent(new CustomEvent('vertice_consent_analytics', { detail: true }));
    }
    if (consent.marketing) {
      window.dispatchEvent(new CustomEvent('vertice_consent_marketing', { detail: true }));
    }
  }

  // Injeta estilos CSS isolados para animações, toggles e layout do banner e modal
  function injectStyles() {
    if (document.getElementById('vertice-cookie-consent-styles')) return;

    const style = document.createElement('style');
    style.id = 'vertice-cookie-consent-styles';
    style.textContent = `
      #vertice-cookie-consent-banner {
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        max-width: 78rem;
        margin: 0 auto;
        z-index: 9999;
        background: rgba(11, 15, 25, 0.95);
        color: #f8fafc;
        border-radius: 1rem;
        border: 1px solid rgba(212, 175, 55, 0.35);
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        animation: verticeCookieSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      #vertice-cookie-consent-banner.vertice-closing {
        opacity: 0;
        transform: translateY(24px);
        pointer-events: none;
      }

      @keyframes verticeCookieSlideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Eleva o botão flutuante do WhatsApp enquanto o banner estiver ativo para não haver sobreposição */
      body.vertice-cookie-banner-active a[href*="wa.me"],
      body.vertice-cookie-banner-active a[href*="whatsapp.com"],
      body.vertice-cookie-banner-active .whatsapp-pulse,
      body.vertice-cookie-banner-active aside[aria-label*="WhatsApp"] {
        transform: translateY(-90px) scale(0.95);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @media (max-width: 640px) {
        body.vertice-cookie-banner-active a[href*="wa.me"],
        body.vertice-cookie-banner-active a[href*="whatsapp.com"],
        body.vertice-cookie-banner-active .whatsapp-pulse,
        body.vertice-cookie-banner-active aside[aria-label*="WhatsApp"] {
          transform: translateY(-165px) scale(0.9);
        }
      }

      /* Botão Dourado Premium */
      .vertice-btn-gold {
        background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
        color: #080c14;
        font-weight: 700;
        transition: all 0.25s ease;
      }
      .vertice-btn-gold:hover {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
        transform: translateY(-1px);
      }

      /* Toggle Switch */
      .vertice-toggle-switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
        flex-shrink: 0;
      }
      .vertice-toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .vertice-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #334155;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 26px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .vertice-toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: #f8fafc;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      }
      .vertice-toggle-switch input:checked + .vertice-toggle-slider {
        background: linear-gradient(135deg, #d4af37, #b8860b);
        border-color: rgba(212, 175, 55, 0.6);
      }
      .vertice-toggle-switch input:checked + .vertice-toggle-slider:before {
        transform: translateX(22px);
        background-color: #080c14;
      }
      .vertice-toggle-switch input:disabled + .vertice-toggle-slider {
        opacity: 0.65;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // Renderiza o banner de consentimento na parte inferior da tela
  function renderBanner() {
    if (document.getElementById('vertice-cookie-consent-banner')) return;

    injectStyles();
    document.body.classList.add('vertice-cookie-banner-active');

    const banner = document.createElement('aside');
    banner.id = 'vertice-cookie-consent-banner';
    banner.setAttribute('role', 'region');
    const i18n = getI18n();
    banner.setAttribute('aria-label', i18n.bannerAria);

    const privacyUrl = getPrivacyPolicyUrl();

    banner.innerHTML = `
      <div class="p-4 sm:p-5 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        <!-- Text & Info -->
        <div class="flex items-start gap-3.5 sm:gap-4 max-w-4xl">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-amber-400 shadow-md shadow-amber-950/40">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="font-heading font-bold text-white text-sm sm:text-base flex items-center gap-2">
              ${i18n.bannerTitle}
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">${i18n.bannerBadge}</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ${i18n.bannerText}
              <a href="${privacyUrl}" class="text-amber-400 hover:text-amber-300 underline font-medium ml-1 transition-colors">
                ${i18n.bannerPolicyLink}
              </a>
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto flex-shrink-0 justify-end">
          <button type="button" id="vertice-cookie-customize-btn" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-all text-center flex-1 sm:flex-initial">
            ${i18n.btnCustomize}
          </button>
          <button type="button" id="vertice-cookie-reject-btn" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 transition-all text-center flex-1 sm:flex-initial">
            ${i18n.btnReject}
          </button>
          <button type="button" id="vertice-cookie-accept-all-btn" class="vertice-btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/60 hover:shadow-amber-500/30 transition-all text-center flex-1 sm:flex-initial">
            ${i18n.btnAcceptAll}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Eventos dos botões do banner
    const acceptAllBtn = document.getElementById('vertice-cookie-accept-all-btn');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
      });
    }

    const rejectBtn = document.getElementById('vertice-cookie-reject-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        saveConsent({ essential: true, analytics: false, marketing: false });
      });
    }

    const customizeBtn = document.getElementById('vertice-cookie-customize-btn');
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        openModal();
      });
    }
  }

  // Fecha o banner com animação suave e restaura a posição do WhatsApp
  function closeBanner() {
    document.body.classList.remove('vertice-cookie-banner-active');
    const banner = document.getElementById('vertice-cookie-consent-banner');
    if (banner) {
      banner.classList.add('vertice-closing');
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    }
  }

  // Renderiza o modal detalhado de categorias
  function renderModal() {
    if (document.getElementById('vertice-cookie-modal-container')) return;

    injectStyles();

    const currentConsent = getStoredConsent() || { essential: true, analytics: false, marketing: false };
    const privacyUrl = getPrivacyPolicyUrl();
    const i18n = getI18n();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'vertice-cookie-modal-container';
    modalContainer.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300';
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    modalContainer.setAttribute('aria-labelledby', 'vertice-cookie-modal-title');

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-xl bg-[#0b0f19] border border-amber-500/35 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-left transform transition-all duration-300 max-h-[92vh] flex flex-col">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="vertice-cookie-modal-title" class="font-heading font-bold text-white text-lg sm:text-xl">${i18n.modalTitle}</h2>
              <p class="text-xs text-slate-400">${i18n.modalSubtitle}</p>
            </div>
          </div>
          <button type="button" id="vertice-cookie-modal-close-x" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Fechar modal">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body: Categorias com Toggles -->
        <div class="py-4 space-y-3.5 overflow-y-auto pr-1 flex-1">
          <p class="text-xs text-slate-300 leading-relaxed">
            ${i18n.modalIntro}
          </p>

          <!-- 1. Estritamente Necessários -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">${i18n.essentialTitle}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">${i18n.alwaysActive}</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                ${i18n.essentialDesc}
              </p>
            </div>
            <div class="flex-shrink-0 pt-0.5">
              <label class="vertice-toggle-switch" title="Obrigatório para o funcionamento do site">
                <input type="checkbox" checked disabled>
                <span class="vertice-toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- 2. Analíticos e Métricas -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">${i18n.analyticsTitle}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">${i18n.optional}</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                ${i18n.analyticsDesc}
              </p>
            </div>
            <div class="flex-shrink-0 pt-0.5">
              <label class="vertice-toggle-switch" for="vertice-toggle-analytics" title="Ativar ou desativar cookies analíticos">
                <input type="checkbox" id="vertice-toggle-analytics" ${currentConsent.analytics ? 'checked' : ''}>
                <span class="vertice-toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- 3. Marketing e Remarketing -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-heading font-semibold text-sm text-white">${i18n.marketingTitle}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">${i18n.optional}</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                ${i18n.marketingDesc}
              </p>
            </div>
            <div class="flex-shrink-0 pt-0.5">
              <label class="vertice-toggle-switch" for="vertice-toggle-marketing" title="Ativar ou desativar cookies de marketing">
                <input type="checkbox" id="vertice-toggle-marketing" ${currentConsent.marketing ? 'checked' : ''}>
                <span class="vertice-toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="pt-1 text-center sm:text-left">
            <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-400 hover:text-amber-300 underline transition-colors">
              ${i18n.fullPolicyLink}
            </a>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button type="button" id="vertice-modal-reject-btn" class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all text-center">
            ${i18n.btnReject}
          </button>
          <button type="button" id="vertice-modal-save-custom-btn" class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-all text-center">
            ${i18n.btnSaveCustom}
          </button>
          <button type="button" id="vertice-modal-accept-all-btn" class="w-full sm:w-auto vertice-btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/60 hover:shadow-amber-500/30 transition-all text-center">
            ${i18n.btnAcceptAll}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modalContainer);

    // Fechamento no X e no backdrop
    const closeBtn = document.getElementById('vertice-cookie-modal-close-x');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });

    // Fechar ao pressionar ESC
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Botões de Ação do Modal
    const modalAcceptAll = document.getElementById('vertice-modal-accept-all-btn');
    if (modalAcceptAll) {
      modalAcceptAll.addEventListener('click', () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
      });
    }

    const modalReject = document.getElementById('vertice-modal-reject-btn');
    if (modalReject) {
      modalReject.addEventListener('click', () => {
        saveConsent({ essential: true, analytics: false, marketing: false });
      });
    }

    const modalSaveCustom = document.getElementById('vertice-modal-save-custom-btn');
    if (modalSaveCustom) {
      modalSaveCustom.addEventListener('click', () => {
        const analyticsEl = document.getElementById('vertice-toggle-analytics');
        const marketingEl = document.getElementById('vertice-toggle-marketing');
        saveConsent({
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
      }, 250);
    }
  }

  // Inicialização do sistema
  function init() {
    const savedConsent = getStoredConsent();
    if (!savedConsent) {
      renderBanner();
    } else {
      applyConsent(savedConsent);
    }

    // Ouvinte global para qualquer botão/link de abertura de preferências
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-cookie-settings], a[href="#gerenciar-cookies"], a[href="#cookies-config"], a[href$="#cookies"]');
      if (trigger) {
        // Se for um link para #cookies na mesma página ou de rodapé, abre o modal
        const href = trigger.getAttribute('href') || '';
        if (trigger.hasAttribute('data-open-cookie-settings') || href.includes('#cookies') || href.includes('#gerenciar-cookies') || href.includes('#cookies-config')) {
          e.preventDefault();
          openModal();
        }
      }
    });

    // Se a página carregar diretamente com a hash #cookies ou #cookies-config, abre o modal
    if (window.location.hash === '#cookies-config' || window.location.hash === '#gerenciar-cookies') {
      setTimeout(openModal, 400);
    }
  }

  // API Pública global exposta na janela
  const publicApi = {
    openModal: openModal,
    closeModal: closeModal,
    acceptAll: function () {
      return saveConsent({ essential: true, analytics: true, marketing: true });
    },
    rejectOptional: function () {
      return saveConsent({ essential: true, analytics: false, marketing: false });
    },
    getPreferences: getStoredConsent,
    hasConsent: function (category) {
      const consent = getStoredConsent();
      if (!consent) return false;
      if (category === 'essential') return true;
      return Boolean(consent[category]);
    },
    resetConsent: function () {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
      renderBanner();
    }
  };

  window.VerticeCookieConsent = publicApi;
  window.VerticeConsent = publicApi;
  window.openVerticeCookieSettings = openModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
