// Language Switcher Functionality
class LanguageSwitcher {
    constructor() {
        this.currentLang = 'pt'; // Default language is Portuguese
        this.init();
    }

    init() {
        // Check if there's a saved language preference
        const savedLang = localStorage.getItem('hs-language');
        if (savedLang) {
            this.currentLang = savedLang;
        }

        // Set initial language
        this.setLanguage(this.currentLang);

        // Add event listeners to language switcher buttons
        this.addEventListeners();
    }

    addEventListeners() {
        const langButtons = document.querySelectorAll('.lang-switcher-btn');
        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetLang = button.getAttribute('data-lang');
                this.switchToLanguage(targetLang);
            });
        });
    }

    switchToLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        this.setLanguage(lang);
        localStorage.setItem('hs-language', lang);

        // Update active button
        this.updateActiveButton();
    }

    setLanguage(lang) {
        const htmlElement = document.documentElement;
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.includes('/en/');

        if (lang === 'en') {
            if (!isEnglish) {
                let fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
                if (!fileName) {
                    fileName = 'index.html';
                }
                window.location.href = `en/${fileName}`;
            }
        } else { // lang === 'pt'
            if (isEnglish) {
                window.location.href = window.location.href.replace('/en', '');
            }
        }
    }

    updateActiveButton() {
        const langButtons = document.querySelectorAll('.lang-switcher-btn');
        langButtons.forEach(button => {
            const buttonLang = button.getAttribute('data-lang');
            if (buttonLang === this.currentLang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

// Initialize language switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new LanguageSwitcher();
});
