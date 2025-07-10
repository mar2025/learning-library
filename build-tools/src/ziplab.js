// Modern ziplab JavaScript bundle - replaces jQuery dependencies
import './styles/ziplab.scss';
import { TocGenerator } from './shared/toc-generator';
import { LazyLoader } from './shared/lazy-loader';
import { Navigation } from './shared/navigation';
import { Analytics } from './shared/analytics';

class ZiplabApp {
  constructor() {
    this.toc = null;
    this.navigation = null;
    this.lazyLoader = null;
    this.analytics = null;
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    console.log('🚀 Initializing Ziplab app...');

    try {
      // Initialize components
      this.initializeNavigation();
      this.initializeTOC();
      this.initializeLazyLoading();
      this.initializeAnalytics();
      this.setupEventListeners();
      
      console.log('✅ Ziplab app initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Ziplab app:', error);
    }
  }

  initializeNavigation() {
    this.navigation = new Navigation({
      showNavSelector: '#shownav',
      hideNavSelector: '#hidenavw',
      sidebarSelector: '#sidebar',
      breakpoint: 768
    });
    this.navigation.init();
  }

  initializeTOC() {
    const tocContainer = document.getElementById('toc');
    if (tocContainer) {
      this.toc = new TocGenerator({
        container: tocContainer,
        contentSelector: 'article',
        headingSelectors: 'h1, h2, h3, h4',
        activeClass: 'active'
      });
      this.toc.generate();
    }
  }

  initializeLazyLoading() {
    this.lazyLoader = new LazyLoader({
      imageSelector: 'img[data-src]',
      rootMargin: '50px',
      threshold: 0.1
    });
    this.lazyLoader.init();
  }

  initializeAnalytics() {
    this.analytics = new Analytics({
      prefix: 'OBE',
      trackClicks: true,
      trackScroll: true
    });
    this.analytics.init();
  }

  setupEventListeners() {
    // Smooth scrolling for anchor links
    this.setupSmoothScrolling();
    
    // Handle code block interactions
    this.setupCodeBlocks();
    
    // Handle responsive behavior
    this.setupResponsive();
  }

  setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without scrolling
        history.replaceState(null, null, `#${targetId}`);
      }
    });
  }

  setupCodeBlocks() {
    // Enhanced code block functionality
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      // Add copy button
      this.addCopyButton(block);
      
      // Add language label
      this.addLanguageLabel(block);
    });
  }

  addCopyButton(codeBlock) {
    const pre = codeBlock.parentElement;
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = '📋 Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent);
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = '📋 Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        button.textContent = '❌ Failed';
        setTimeout(() => {
          button.textContent = '📋 Copy';
        }, 2000);
      }
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  }

  addLanguageLabel(codeBlock) {
    const className = codeBlock.className;
    const languageMatch = className.match(/language-(\w+)/);
    
    if (languageMatch) {
      const language = languageMatch[1];
      const label = document.createElement('span');
      label.className = 'code-language-label';
      label.textContent = language.toUpperCase();
      
      const pre = codeBlock.parentElement;
      pre.insertBefore(label, codeBlock);
    }
  }

  setupResponsive() {
    // Handle responsive navigation
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.navigation) {
          this.navigation.handleResize();
        }
      }, 250);
    });

    // Handle print styles
    window.addEventListener('beforeprint', () => {
      document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
    });
  }
}

// Performance monitoring
class PerformanceMonitor {
  static init() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;
          
          console.log('📊 Page Performance:', {
            'Load Time': `${loadTime}ms`,
            'DOM Content Loaded': `${perfData.domContentLoadedEventEnd - perfData.fetchStart}ms`,
            'First Paint': PerformanceMonitor.getFirstPaint(),
            'Largest Contentful Paint': PerformanceMonitor.getLCP()
          });
        }, 0);
      });
    }
  }

  static getFirstPaint() {
    const fpEntry = performance.getEntriesByName('first-paint')[0];
    return fpEntry ? `${Math.round(fpEntry.startTime)}ms` : 'N/A';
  }

  static getLCP() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(`${Math.round(lastEntry.startTime)}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }
}

// Initialize application
const app = new ZiplabApp();
app.init();

// Initialize performance monitoring
PerformanceMonitor.init();

// Service Worker registration for caching
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// Export for testing
export { ZiplabApp, PerformanceMonitor };