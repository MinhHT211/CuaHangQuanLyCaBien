/**
 * Lightbox Component
 * Handles lightbox functionality for all images across the website
 * Simplified to handle JPG files only
 */
const Lightbox = (function() {
    let lightbox;
    let lightboxImage;
    let lightboxClose;
    let currentGalleryItems = [];
    let currentIndex = 0;
    let isLoading = false;
    let isInitialized = false;
    
    function init() {
        console.log('Lightbox.init() called');
        
        if (isInitialized) {
            console.log('Lightbox already initialized, skipping');
            return;
        }
        
        // First, create the lightbox HTML structure if it doesn't exist
        if (!document.querySelector('.lightbox')) {
            createLightboxElement();
        }
        
        // Get lightbox elements
        lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
        lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
        lightboxClose = document.querySelector('.lightbox-close');
        
        if (!lightbox || !lightboxImage || !lightboxClose) {
            console.warn('Lightbox elements not found, creating them');
            createLightboxElement();
            
            // Try to get elements again
            lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
            lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
            lightboxClose = document.querySelector('.lightbox-close');
            
            if (!lightbox || !lightboxImage || !lightboxClose) {
                console.error('Still could not find lightbox elements');
                return;
            }
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
        
        // Add global event listener for images
        document.addEventListener('click', function(e) {
            // Direct couple image click handler
            if (e.target.matches('.couple-image img')) {
                console.log('Couple image clicked via global handler');
                e.preventDefault();
                e.stopPropagation();
                open(e.target.src, e.target.alt || 'Couple Image');
            }
        });
        
        // Setup triggers for static elements
        setupLightboxTriggers();
        
        // Mark as initialized
        isInitialized = true;
        console.log('Lightbox initialized successfully');
    }
    
    function createLightboxElement() {
        console.log('Creating lightbox element');
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
    
    function setupLightboxTriggers() {
        console.log('Setting up lightbox triggers');
        
        // Add click events to all portrait images in couple-intro section
        const portraitImages = document.querySelectorAll('.portrait-img');
        portraitImages.forEach(img => {
            img.style.cursor = 'pointer'; // Make it clear they're clickable
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                open(this.src, this.alt || 'Portrait Image');
            });
        });
        
        // Add click event to couple image
        const coupleImage = document.querySelector('.couple-image img');
        if (coupleImage) {
            console.log('Found couple image in setupLightboxTriggers');
            coupleImage.style.cursor = 'pointer';
            coupleImage.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Couple image clicked in setupLightboxTriggers');
                open(this.src, this.alt || 'Couple Image');
            });
        } else {
            console.warn('Couple image not found in setupLightboxTriggers');
        }
    }
    
    function open(src, alt = 'Gallery Image', galleryItems = [], index = 0) {
        console.log('Lightbox.open() called for:', src);
        
        // Prevent multiple calls for same image
        if (isLoading) {
            console.log('Still loading previous image, skipping');
            return;
        }
        isLoading = true;
        
        // Make sure lightbox is initialized
        if (!isInitialized) {
            init();
        }
        
        // Store current gallery items and index for navigation
        currentGalleryItems = galleryItems;
        currentIndex = index;
        
        // Clear previous load/error handlers to prevent race conditions
        if (lightboxImage) {
            lightboxImage.onload = null;
            lightboxImage.onerror = null;
            lightboxImage.src = "";
            lightboxImage.classList.remove('loaded');
        }
        
        // Set image alt
        lightboxImage.alt = alt;
        
        // Show loading indicator
        const loadingIndicator = document.querySelector('.lightbox-loading');
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        // Define success handler
        lightboxImage.onload = function() {
            console.log('Lightbox image loaded');
            
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            // Show image
            lightboxImage.classList.add('loaded');
            isLoading = false;
            
            // Update navigation buttons visibility
            updateNavigation();
        };
        
        // Define error handler
        lightboxImage.onerror = function() {
            console.error('Error loading image:', src);
            isLoading = false;
            
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<div class="error-message">Failed to load image</div>';
            }
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
        
        // Important: Set the src AFTER setting up the event handlers
        setTimeout(() => {
            lightboxImage.src = src;
        }, 50);
    }
    
    function close() {
        console.log('Lightbox.close() called');
        if (!lightbox) return;
        
        // IMPORTANT - Reset loading flag immediately when closing
        isLoading = false;
        
        // Prevent further image events from triggering
        if (lightboxImage) {
            lightboxImage.onload = null;
            lightboxImage.onerror = null;
        }
        
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
            prevButton.style.display = currentIndex > 0 && currentGalleryItems.length > 1 ? 'flex' : 'none';
        }
        
        if (nextButton) {
            nextButton.style.display = currentIndex < currentGalleryItems.length - 1 ? 'flex' : 'none';
        }
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 100); // Short delay to ensure DOM is ready
    });
    
    // Initialize when components are loaded
    document.addEventListener('componentsLoaded', function() {
        setTimeout(function() {
            init();
            // Re-setup triggers to catch newly loaded components
            setupLightboxTriggers();
        }, 500); // Longer delay for component loading
    });
    
    return {
        init: init,
        open: open,
        close: close,
        prev: prev,
        next: next,
        setupTriggers: setupLightboxTriggers
    };
})();