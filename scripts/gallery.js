/**
 * Enhanced Gallery Component
 * Features:
 * - Optimized for large photo galleries
 * - "Lazy loading" for performance
 * - Smooth navigation between images in lightbox
 */

// Gallery Module
const Gallery = (function() {
    function init() {
        console.log('Gallery init called');
        initTabs();
        initLazyLoading();
        initGalleryItemEvents();
    }
    
    function initTabs() {
        const galleryTabs = document.querySelectorAll('.gallery-tab');
        const galleryCategories = document.querySelectorAll('.gallery-category');
        
        console.log('Found gallery tabs:', galleryTabs.length);
        console.log('Found gallery categories:', galleryCategories.length);
        
        if (galleryTabs.length && galleryCategories.length) {
            galleryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    console.log('Tab clicked:', tab.getAttribute('data-category'));
                    
                    // Remove active class from all tabs
                    galleryTabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Hide all gallery categories
                    galleryCategories.forEach(cat => cat.classList.remove('active'));
                    
                    // Show the selected category
                    const category = tab.getAttribute('data-category');
                    const targetCategory = document.getElementById(category);
                    if (targetCategory) {
                        targetCategory.classList.add('active');
                        
                        // Initialize lazy loading for this tab
                        initLazyLoadingForContainer(targetCategory);
                    }
                });
            });
        } else {
            console.warn('Gallery elements not found');
        }
    }
    
    function initGalleryItemEvents() {
        // Add click handlers to all gallery items
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const img = item.querySelector('img');
                if (img) {
                    const imgSrc = img.getAttribute('data-full') || img.src;
                    const container = item.closest('.gallery-category');
                    if (container) {
                        const galleryItems = container.querySelectorAll('.gallery-item');
                        const currentIndex = Array.from(galleryItems).indexOf(item);
                        
                        // Use the shared Lightbox module
                        Lightbox.open(imgSrc, img.alt, galleryItems, currentIndex);
                    } else {
                        // Fallback for single image
                        Lightbox.open(imgSrc, img.alt);
                    }
                }
            });
        });
    }
    
    function initLazyLoading() {
        // Initialize lazy loading for the active tab first
        const activeContainer = document.querySelector('.gallery-category.active');
        if (activeContainer) {
            initLazyLoadingForContainer(activeContainer);
        }
    }
    
    function initLazyLoadingForContainer(container) {
        const galleryItems = container.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img && !img.classList.contains('loaded')) {
                // Add cursor pointer to indicate clickable
                img.style.cursor = 'pointer';
                item.style.cursor = 'pointer';
            }
        });
        
        // Use Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('src');
                        
                        if (src && src.includes('placeholder')) {
                            // Replace placeholder with actual image
                            const actualSrc = img.getAttribute('data-src') || 
                                            'images/wedding/thumbnails/' + img.getAttribute('data-full').split('/').pop();
                                            
                            img.src = actualSrc;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                root: null, // viewport
                rootMargin: '100px',
                threshold: 0.1
            });
            
            // Observe all images in this container
            const images = container.querySelectorAll('.gallery-image:not(.loaded)');
            images.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support Intersection Observer
            const images = container.querySelectorAll('.gallery-image:not(.loaded)');
            images.forEach(img => {
                img.src = img.getAttribute('data-src') || 
                        'images/wedding/thumbnails/' + img.getAttribute('data-full').split('/').pop();
                img.classList.add('loaded');
            });
        }
    }
    
    return {
        init: init,
        reinitialize: function() {
            console.log('Gallery reinitialize called');
            initTabs();
            initGalleryItemEvents();
        }
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready - initializing Gallery');
    Gallery.init();
});

// Initialize on componentsLoaded event (for component-based websites)
document.addEventListener('componentsLoaded', function() {
    console.log('Components loaded - reinitializing Gallery');
    Gallery.reinitialize();
});