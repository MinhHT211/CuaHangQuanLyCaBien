/**
 * Enhanced Gallery and Lightbox Component
 * Features:
 * - Optimized for large photo galleries
 * - "Lazy loading" for performance
 * - Smooth navigation between images in lightbox
 */

// Gallery Module
const Gallery = (function() {
    function init() {
        initTabs();
        initLazyLoading();
    }
    
    function initTabs() {
        const galleryTabs = document.querySelectorAll('.gallery-tab');
        const galleryCategories = document.querySelectorAll('.gallery-category');
        
        if (galleryTabs.length && galleryCategories.length) {
            galleryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
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
                // Add click event listener for lightbox
                item.addEventListener('click', () => {
                    const imgSrc = img.getAttribute('data-full') || img.src;
                    const galleryItems = container.querySelectorAll('.gallery-item');
                    const currentIndex = Array.from(galleryItems).indexOf(item);
                    
                    Lightbox.open(imgSrc, img.alt, galleryItems, currentIndex);
                });
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
        init: init
    };
})();

// Lightbox Module
const Lightbox = (function() {
    let lightbox;
    let lightboxImage;
    let lightboxClose;
    let currentGalleryItems = [];
    let currentIndex = 0;
    let isLoading = false;
    
    function init() {
        // Create lightbox if it doesn't exist
        if (!document.getElementById('gallery-lightbox')) {
            createLightboxElement();
        }
        
        // Get lightbox elements
        lightbox = document.getElementById('gallery-lightbox');
        lightboxImage = document.getElementById('lightbox-image');
        lightboxClose = document.querySelector('.lightbox-close');
        
        if (!lightbox || !lightboxImage || !lightboxClose) {
            console.warn('Lightbox elements not found');
            return;
        }
        
        // Add event listener to close button
        lightboxClose.addEventListener('click', close);
        
        // Add event listener to close when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                close();
            }
        });
        
        // Add keyboard event to close on ESC key and navigate with arrow keys
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            switch (e.key) {
                case 'Escape':
                    close();
                    break;
                case 'ArrowLeft':
                    prev();
                    break;
                case 'ArrowRight':
                    next();
                    break;
            }
        });
        
        // Add swipe detection for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const threshold = 50;
            if (touchEndX - touchStartX > threshold) {
                // Swipe right - go to previous
                prev();
            } else if (touchStartX - touchEndX > threshold) {
                // Swipe left - go to next
                next();
            }
        }
    }
    
    function createLightboxElement() {
        const lightboxHtml = `
            <div class="lightbox" id="gallery-lightbox">
                <span class="lightbox-close">&times;</span>
                <div class="lightbox-nav lightbox-prev">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="lightbox-content">
                    <div class="lightbox-loading">
                        <div class="spinner"></div>
                        <div>Loading...</div>
                    </div>
                    <img src="" alt="Gallery Image" class="lightbox-img" id="lightbox-image">
                </div>
                <div class="lightbox-nav lightbox-next">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    }
    
    function open(src, alt = 'Gallery Image', galleryItems = [], index = 0) {
        if (isLoading) return;
        isLoading = true;
        
        // Store current gallery items and index for navigation
        currentGalleryItems = galleryItems;
        currentIndex = index;
        
        // Get lightbox elements if not already defined
        if (!lightbox) {
            init();
        }
        
        // Set image source and alt
        lightboxImage.src = src;
        lightboxImage.alt = alt;
        lightboxImage.classList.remove('loaded');
        
        // Show loading indicator
        const loadingIndicator = document.querySelector('.lightbox-loading');
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        // When image is loaded, hide loading indicator and show image
        lightboxImage.onload = function() {
            // Hide loading indicator
            const loadingIndicator = document.querySelector('.lightbox-loading');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            // Show image
            lightboxImage.classList.add('loaded');
            isLoading = false;
            
            // Update navigation buttons visibility
            updateNavigation();
        };
        
        // Show lightbox
        lightbox.classList.add('active');
        
        // Prevent page scrolling when lightbox is open
        document.body.style.overflow = 'hidden';
        
        // Set up navigation buttons
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');
        
        if (prevButton) prevButton.addEventListener('click', prev);
        if (nextButton) nextButton.addEventListener('click', next);
        
        // Update navigation buttons visibility
        updateNavigation();
    }
    
    function close() {
        if (!lightbox) return;
        
        // Hide lightbox
        lightbox.classList.remove('active');
        
        // Re-enable page scrolling
        document.body.style.overflow = '';
        
        // Clear image source after transition
        setTimeout(() => {
            if (lightboxImage) {
                lightboxImage.src = '';
                lightboxImage.classList.remove('loaded');
            }
        }, 300);
        
        // Remove navigation event listeners
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');
        
        if (prevButton) prevButton.removeEventListener('click', prev);
        if (nextButton) nextButton.removeEventListener('click', next);
    }
    
    function prev() {
        if (currentIndex > 0 && currentGalleryItems.length > 0 && !isLoading) {
            currentIndex--;
            const prevItem = currentGalleryItems[currentIndex];
            const img = prevItem.querySelector('img');
            if (img) {
                const src = img.getAttribute('data-full') || img.src;
                open(src, img.alt, currentGalleryItems, currentIndex);
            }
        }
    }
    
    function next() {
        if (currentIndex < currentGalleryItems.length - 1 && !isLoading) {
            currentIndex++;
            const nextItem = currentGalleryItems[currentIndex];
            const img = nextItem.querySelector('img');
            if (img) {
                const src = img.getAttribute('data-full') || img.src;
                open(src, img.alt, currentGalleryItems, currentIndex);
            }
        }
    }
    
    function updateNavigation() {
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');
        
        if (prevButton) {
            prevButton.style.display = currentIndex > 0 ? 'flex' : 'none';
        }
        
        if (nextButton) {
            nextButton.style.display = currentIndex < currentGalleryItems.length - 1 ? 'flex' : 'none';
        }
    }
    
    return {
        init: init,
        open: open,
        close: close,
        prev: prev,
        next: next
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    Lightbox.init();
});

// Initialize on componentsLoaded event (for component-based websites)
document.addEventListener('componentsLoaded', function() {
    Gallery.init();
    Lightbox.init();
});