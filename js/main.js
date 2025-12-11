document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navList = document.querySelector('.nav-list');
    const navClose = document.querySelector('.nav-close');

    // Open Menu
    mobileToggle.addEventListener('click', () => {
        navList.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close Menu
    navClose.addEventListener('click', () => {
        navList.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close on Outside Click (Optional, adds polish)
    document.addEventListener('click', (e) => {
        if (navList.classList.contains('active') &&
            !navList.contains(e.target) &&
            !mobileToggle.contains(e.target)) {
            navList.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const matchElements = document.querySelectorAll('.reveal');
    matchElements.forEach(el => observer.observe(el));

    // Active Link Auto-Highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove hardcoded active classes
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // --- FAQ Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(i => { if (i !== item) i.classList.remove('active'); });
                item.classList.toggle('active');
            });
        }
    });

    // --- Search Overlay Logic ---
    // 1. Inject Search Icon if missing
    if (!document.querySelector('.search-trigger')) {
        const navList = document.querySelector('.nav-list');
        if (navList) {
            const li = document.createElement('li');
            li.style.marginLeft = '15px';
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.innerHTML = '<i class="ph ph-magnifying-glass search-trigger" style="font-size: 20px; cursor: pointer; color: var(--color-primary);"></i>';
            navList.appendChild(li);
        }
    }

    // 2. Inject Overlay HTML
    if (!document.querySelector('.search-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <i class="ph ph-x search-close"></i>
            <input type="text" class="search-input" placeholder="Search Paints (e.g. Satin, Blue)...">
        `;
        document.body.appendChild(overlay);

        // Events
        const trigger = document.querySelector('.search-trigger');
        const close = overlay.querySelector('.search-close');
        const input = overlay.querySelector('.search-input');

        // Note: trigger might be dynamically added above, so we delegate or simple check
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-trigger')) {
                overlay.classList.add('active');
                setTimeout(() => input.focus(), 100);
            }
        });

        if (close) close.addEventListener('click', () => overlay.classList.remove('active'));

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = input.value.trim();
                    if (query) {
                        window.location.href = `projects.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }
});
