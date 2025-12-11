// Product Data (Acting as Database)
const products = {
    'super-emulsion': {
        name: 'Super Emulsion',
        category: 'Emulsion',
        price: '₦25,000',
        desc: 'Our Super Emulsion is a premium water-based paint that offers a smooth matte finish. It is durable, easy to apply, and perfect for interior walls and ceilings. Available in a wide range of colors.',
        image: 'assets/images/service_roller.png',
        features: ['Smooth Matte Finish', 'High Coverage', 'Quick Drying', 'Low Odor']
    },
    'royal-satin': {
        name: 'Royal Satin',
        category: 'Satin',
        price: '₦45,000',
        desc: 'Royal Satin provides a luxurious, silky finish that is tough and washable. Ideal for high-traffic areas like hallways, kitchens, and bathrooms where durability is key.',
        image: 'assets/images/service_brush.png',
        features: ['Silky Sheen', 'Washable & Scrubbable', 'Stain Resistant', 'Long Lasting']
    },
    'textured-cote': {
        name: 'Textured Cote',
        category: 'Texcote',
        price: '₦38,000',
        desc: 'Designed for exterior protection, Textured Cote offers a rough, decorative finish that hides imperfections and withstands harsh weather conditions.',
        image: 'assets/images/service_spray.png',
        features: ['Weather Resistant', 'Hides Imperfections', 'Fungi & Algae Resistant', 'Durable']
    },
    'high-gloss': {
        name: 'High Gloss',
        category: 'Gloss',
        price: '₦30,000',
        desc: 'High Gloss enamel paint gives a brilliant shiny finish. Perfect for wood, metal, and trims. It provides a hard, protective shell.',
        image: 'assets/images/about_us.png',
        features: ['High Shine', 'Protective Layer', 'For Wood & Metal', 'Easy to Clean']
    },
    'standard-emulsion': {
        name: 'Standard Emulsion',
        category: 'Emulsion',
        price: '₦15,000',
        desc: 'An economical choice for quality painting on a budget. Provides good coverage and a neat matte finish for standard applications.',
        image: 'assets/images/hero_bg.png',
        features: ['Economical', 'Good Coverage', 'Matte Finish', 'Interior Use']
    },
    'silk-sheen': {
        name: 'Silk Sheen',
        category: 'Satin',
        price: '₦42,000',
        desc: 'Silk Sheen offers a beautiful mid-sheen finish that reflects light subtly, making rooms feel larger and brighter.',
        image: 'assets/images/project_1.png',
        features: ['Subtle Sheen', 'Light Reflecting', 'Elegant Look', 'Wipeable']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // 2. Find Product
    const product = products[productId];

    // Simulating Network Delay for Premium Feel (500ms)
    const delay = 500;

    setTimeout(() => {
        const loadingContainer = document.getElementById('loading-state');
        const contentContainer = document.getElementById('product-content');

        if (loadingContainer) loadingContainer.classList.add('hidden');
        if (contentContainer) contentContainer.classList.remove('hidden');

        if (product) {
            // 3. Populate UI
            document.getElementById('page-title').textContent = product.name.toUpperCase();
            document.getElementById('breadcrumb-name').textContent = product.name;
            document.getElementById('product-img').src = product.image;
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-category').textContent = product.category;
            // Price removed
            document.getElementById('product-desc').textContent = product.desc;

            // Features List
            const featureList = document.getElementById('product-features');
            product.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="ph ph-check-circle"></i> ${feature}`;
                featureList.appendChild(li);
            });

            // Whatsapp Link - Inquiry Focused
            const msg = `Hello, I am interested in your painting services and would like to know more about ${product.name}.`;
            document.getElementById('order-btn').href = `https://wa.me/2348099577832?text=${encodeURIComponent(msg)}`;

        } else {
            // Handle Not Found
            if (contentContainer) contentContainer.innerHTML = '<h2>Product Not Found</h2><p>Please return to the gallery.</p>';
        }
    }, delay);
});

