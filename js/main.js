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
});
