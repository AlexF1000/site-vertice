/**
 * VÉRTICE SOCIAL MÍDIA — MAIN JAVASCRIPT
 * Interactions, Count-up animations, Smooth Anchors & WhatsApp Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Counter Animation for Metrics
  const counters = document.querySelectorAll('[data-counter]');
  let animated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-counter'));
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const isDecimal = target % 1 !== 0;
      let start = 0;
      const duration = 2000;
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          counter.innerText = prefix + (isDecimal ? target.toFixed(1) : Math.round(target)) + suffix;
          clearInterval(timer);
        } else {
          counter.innerText = prefix + (isDecimal ? start.toFixed(1) : Math.round(start)) + suffix;
        }
      }, stepTime);
    });
  };

  const metricsSection = document.querySelector('#credibilidade, #depoimentos');
  if (metricsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.25 });
    observer.observe(metricsSection);
  }

  // 2. Navbar Background on Scroll (GPU Throttled via requestAnimationFrame)
  const header = document.querySelector('header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            header.classList.add('shadow-2xl', 'border-b', 'border-amber-500/20');
          } else {
            header.classList.remove('shadow-2xl', 'border-b', 'border-amber-500/20');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 3. Track WhatsApp Conversion Clicks
  const whatsappButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
  whatsappButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const ctaLocation = btn.getAttribute('data-cta-location') || 'unknown';
      console.log(`[Conversão WhatsApp] Clique originado em: ${ctaLocation}`);
      // Google Analytics / Meta Pixel trigger if present
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          'event_category': 'WhatsApp',
          'event_label': ctaLocation
        });
      }
      if (typeof fbq === 'function') {
        fbq('track', 'Contact', { content_name: ctaLocation });
      }
    });
  });

  // 4. Update Current Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.innerText = new Date().getFullYear();
  }

  // 5. Initialize Cookie Consent (LGPD) Engine
  if (!window.VerticeCookieConsent) {
    const mainScript = document.querySelector('script[src*="main.js"]');
    const scriptSrc = mainScript ? mainScript.getAttribute('src') : './assets/js/main.js';
    const cookieScriptSrc = scriptSrc.replace('main.js', 'cookie-consent.js');
    
    // Check if script tag doesn't already exist
    if (!document.querySelector(`script[src="${cookieScriptSrc}"]`)) {
      const cookieScript = document.createElement('script');
      cookieScript.src = cookieScriptSrc;
      cookieScript.defer = true;
      document.body.appendChild(cookieScript);
    }
  }
});
