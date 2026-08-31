/**
 * lang.js — CyberShield SL Bilingual Utility
 * Supports: English (en) | Sinhala (si)
 * Usage: add data-en="English text" data-si="සිංහල text" to any element
 */

const LangUtil = (() => {
    const STORAGE_KEY = 'cyberShieldLang';

    function getCurrentLang() {
        return localStorage.getItem(STORAGE_KEY) || 'en';
    }

    function setLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        applyLang(lang);
        updateToggleBtn(lang);
    }

    function applyLang(lang) {
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute('data-' + lang);
            if (text !== null) {
                // If element has children (like icons), only update text nodes
                if (el.children.length === 0) {
                    el.textContent = text;
                } else {
                    // Update last text node or use innerHTML carefully
                    el.setAttribute('data-current', text);
                    // Find text nodes and update
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === 3 && node.textContent.trim()) {
                            node.textContent = ' ' + text;
                        }
                    });
                }
            }
        });

        // Update placeholder attributes
        document.querySelectorAll('[data-placeholder-en]').forEach(el => {
            const ph = el.getAttribute('data-placeholder-' + lang);
            if (ph) el.placeholder = ph;
        });

        // Update page title if defined
        const titleEl = document.querySelector('[data-title-en]');
        if (titleEl) {
            document.title = titleEl.getAttribute('data-title-' + lang) || document.title;
        }

        // Fire custom event for any page-specific handling
        document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
    }

    function updateToggleBtn(lang) {
        const btn = document.getElementById('langToggleBtn');
        if (!btn) return;
        if (lang === 'en') {
            btn.innerHTML = '🌐 <span>EN</span> | සි';
            btn.title = 'Switch to Sinhala';
        } else {
            btn.innerHTML = '🌐 EN | <span>සි</span>';
            btn.title = 'Switch to English';
        }
    }

    function toggle() {
        const current = getCurrentLang();
        setLang(current === 'en' ? 'si' : 'en');
    }

    function init() {
        // Apply current language on page load
        const lang = getCurrentLang();
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                applyLang(lang);
                updateToggleBtn(lang);
            });
        } else {
            applyLang(lang);
            updateToggleBtn(lang);
        }
    }

    return { init, toggle, getCurrentLang, setLang };
})();

// Auto-init
LangUtil.init();
