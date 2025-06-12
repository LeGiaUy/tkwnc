document.addEventListener('DOMContentLoaded', () => {
    // Ajax Navigation
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const skipLink = !href || href === '#' || href.startsWith('javascript:') || 
                         href.startsWith('mailto:') || href.startsWith('tel:') || 
                         link.target === '_blank' || 
                         link.dataset.bsToggle || link.dataset.bsTarget;
        if (skipLink) return;

        try {
            const url = new URL(href, location.href);
            if (url.origin === location.origin) {
                e.preventDefault();
                navigateAjax(url.href);
            }
        } catch (err) {
            console.error('Invalid URL:', href);
        }
    });

    // Handle back/forward
    window.addEventListener('popstate', () => navigateAjax(location.href, false));
});

// Ajax navigation logic
function navigateAjax(url, push = true) {
    showLoading();

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.text();
        })
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            updatePageContent(doc);
            executeInlineScripts(doc);
            if (push) history.pushState({}, '', url);
            hideLoading();
            initializeAfterAjax();
        })
        .catch(err => {
            console.error('Ajax Error:', err);
            hideLoading();
            if (err.message.includes('HTTP error')) location.href = url;
        });
}

// Update main sections
function updatePageContent(doc) {
    document.title = doc.title;
    ['main', 'header', 'footer'].forEach(tag => {
        const newEl = doc.querySelector(tag);
        const oldEl = document.querySelector(tag);
        if (newEl && oldEl) oldEl.innerHTML = newEl.innerHTML;
    });
}

// Execute scripts from new HTML
function executeInlineScripts(doc) {
    doc.querySelectorAll('script').forEach(script => {
        const newScript = document.createElement('script');
        script.src ? (newScript.src = script.src, newScript.async = false) 
                   : newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
    });
}

// Show/hide loading indicator
function showLoading() {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'block';
}
function hideLoading() {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
}

// Initialize after Ajax
function initializeAfterAjax() {
    initializeScripts();
    window.scrollTo(0, 0);
}

// Initialize plugins and components
function initializeScripts() {
    // AOS
    if (window.AOS) {
        if (window.aosInstance) window.aosInstance.destroy();
        window.aosInstance = AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    }

    // Swiper
    if (window.Swiper) {
        document.querySelectorAll('.swiper').forEach(swiper => {
            if (swiper.swiper) swiper.swiper.destroy(true, true);
            const configEl = swiper.querySelector('.swiper-config');
            if (configEl) swiper.swiper = new Swiper(swiper, JSON.parse(configEl.textContent));
        });
    }

    // Isotope
    if (window.Isotope) {
        document.querySelectorAll('.isotope-container').forEach(container => {
            if (container.isotope) container.isotope.destroy();
            container.isotope = new Isotope(container, {
                itemSelector: '.isotope-item',
                layoutMode: 'masonry',
                transitionDuration: '0.4s'
            });
        });

        document.querySelectorAll('.isotope-filters').forEach(group => {
            const cloned = group.cloneNode(true);
            group.replaceWith(cloned);
            cloned.addEventListener('click', e => {
                const btn = e.target.closest('li');
                if (!btn) return;
                e.preventDefault();
                const filter = btn.getAttribute('data-filter');
                cloned.querySelectorAll('li').forEach(li => li.classList.remove('filter-active'));
                btn.classList.add('filter-active');
                document.querySelectorAll('.isotope-container').forEach(container => {
                    if (container.isotope) container.isotope.arrange({ filter });
                });
            });
        });
    }

    // Initialize Bootstrap components
    initializeBootstrapComponents();
    initScrollTop();
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Helper function to initialize Bootstrap components
    const bootstrapInit = (selector, constructor, opts = {}) => {
        document.querySelectorAll(selector).forEach(el => {
            const instance = bootstrap[constructor].getInstance(el);
            if (instance) instance.dispose();
            new bootstrap[constructor](el, opts);
        });
    };

    // Initialize all Bootstrap components
    bootstrapInit('.dropdown-toggle', 'Dropdown', { offset: [0, 8], boundary: 'viewport' });
    bootstrapInit('[data-bs-toggle="collapse"]', 'Collapse');
    bootstrapInit('[data-bs-toggle="tooltip"]', 'Tooltip');
    bootstrapInit('[data-bs-toggle="popover"]', 'Popover');
    bootstrapInit('.modal', 'Modal');

    // Initialize header components
    initializeHeaderComponents();
}

// Initialize header components
function initializeHeaderComponents() {
    // Initialize account and cart dropdowns
    ['account', 'cart'].forEach(type => {
        const toggle = document.querySelector(`.${type}-dropdown .dropdown-toggle`);
        if (!toggle) return;

        const dropdown = bootstrap.Dropdown.getInstance(toggle);
        if (dropdown) dropdown.dispose();
        new bootstrap.Dropdown(toggle, { offset: [0, 8], boundary: 'viewport' });
    });

    // Initialize mobile search
    const searchToggle = document.querySelector('.mobile-search-toggle');
    if (searchToggle) {
        const collapse = bootstrap.Collapse.getInstance(searchToggle);
        if (collapse) collapse.dispose();
        new bootstrap.Collapse(searchToggle);
    }

    // Initialize mobile navigation
    const navToggle = document.querySelector('.mobile-nav-toggle');
    if (navToggle) {
        // Remove old event listeners
        const newNavToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newNavToggle, navToggle);
        
        newNavToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-active');
            newNavToggle.classList.toggle('bi-list');
            newNavToggle.classList.toggle('bi-x');
        });
    }

    // Initialize main navigation
    initializeMainNavigation();

    // Auto close mobile nav when clicking links
    document.querySelectorAll('#navmenu a').forEach(link => {
        // Remove old event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', () => {
            if (document.body.classList.contains('mobile-nav-active')) {
                document.body.classList.remove('mobile-nav-active');
                const navToggle = document.querySelector('.mobile-nav-toggle');
                if (navToggle) {
                    navToggle.classList.add('bi-list');
                    navToggle.classList.remove('bi-x');
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', e => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Close dropdown when clicking items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        // Remove old event listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', e => {
            e.stopPropagation();
            const menu = newItem.closest('.dropdown-menu');
            if (menu) menu.classList.remove('show');
        });
    });
}

// Initialize main navigation
function initializeMainNavigation() {
    // Initialize all dropdown menus in the main navigation
    document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        // Remove old event listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        // Initialize Bootstrap dropdown
        const dropdownInstance = bootstrap.Dropdown.getInstance(newToggle);
        if (dropdownInstance) dropdownInstance.dispose();
        new bootstrap.Dropdown(newToggle, {
            offset: [0, 8],
            boundary: 'viewport'
        });

        // Add click event to prevent default behavior
        newToggle.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Add click event to dropdown menu
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            const newMenu = menu.cloneNode(true);
            menu.parentNode.replaceChild(newMenu, menu);
            newMenu.addEventListener('click', e => e.stopPropagation());
        }
    });

    // Initialize all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        // Remove old event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Add click event to prevent default behavior for dropdown toggles
        if (newLink.classList.contains('dropdown-toggle')) {
            newLink.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    });
}

// Scroll to top
function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        newBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
