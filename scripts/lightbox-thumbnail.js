/**
 * Lightbox Thumbnail Navigation 
 */
(function() {
    // Configuration
    const DEBUG = false; // Set to true to enable debug logs
    
    // Wait for the page to load
    window.addEventListener('load', function() {
        // Set a delay to ensure our script runs after other scripts
        setTimeout(fixLightboxNavigation, 500);
    });
    
    // Also run when components are loaded
    document.addEventListener('componentsLoaded', function() {
        setTimeout(fixLightboxNavigation, 500);
    });
    
    /**
     * Main fix function
     */
    function fixLightboxNavigation() {
        if (DEBUG) console.log('Applying lightbox navigation fix');
        
        // First, enhance the original gallery script if it exists
        enhanceGalleryScript();
        
        // Add event listener for the lightbox open event
        document.addEventListener('click', function(e) {
            // Check if a gallery item was clicked
            if (e.target.closest('.gallery-item') || e.target.closest('.gallery-overlay')) {
                // Wait for lightbox to open
                setTimeout(fixLightboxThumbnails, 200);
            }
        });
        
        // Also add listener for lightbox navigation buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.lightbox-prev') || e.target.closest('.lightbox-next')) {
                // Wait for image to change
                setTimeout(fixLightboxThumbnails, 100);
            }
        });
        
        // Add keyboard navigation enhancement
        document.addEventListener('keydown', function(e) {
            const lightbox = document.querySelector('.lightbox.active');
            if (!lightbox) return;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // Wait for image to change
                setTimeout(fixLightboxThumbnails, 100);
            }
        });
    }
    
    /**
     * Enhance the original gallery script
     */
    function enhanceGalleryScript() {
        // Check if we have the gallery script loaded
        if (typeof window.createLightboxThumbnails === 'function') {
            // Original function exists, so we can override it
            const originalCreateLightboxThumbnails = window.createLightboxThumbnails;
            
            window.createLightboxThumbnails = function(items, index) {
                // Call original function
                originalCreateLightboxThumbnails(items, index);
                
                // Apply our fixes
                fixLightboxThumbnails();
            };
            
            if (DEBUG) console.log('Enhanced createLightboxThumbnails function');
        }
    }
    
    /**
     * Fix the lightbox thumbnails
     */
    function fixLightboxThumbnails() {
        const lightbox = document.querySelector('.lightbox.active');
        if (!lightbox) return;
        
        if (DEBUG) console.log('Fixing lightbox thumbnails');
        
        // Get the thumbnails strip
        const thumbnailsStrip = lightbox.querySelector('.lightbox-thumbnails');
        if (!thumbnailsStrip) return;
        
        // Get all thumbnails
        const thumbnails = thumbnailsStrip.querySelectorAll('.lightbox-thumbnail');
        if (!thumbnails.length) return;
        
        if (DEBUG) console.log(`Found ${thumbnails.length} thumbnails`);
        
        // Find the active thumbnail
        const activeThumb = thumbnailsStrip.querySelector('.lightbox-thumbnail.active');
        if (!activeThumb) return;
        
        // Get the active index
        const activeIndex = Array.from(thumbnails).indexOf(activeThumb);
        if (DEBUG) console.log(`Active thumbnail index: ${activeIndex}`);
        
        // Improve the left scroll button functionality
        const leftButton = lightbox.querySelector('.thumb-nav-btn.thumb-prev');
        if (leftButton) {
            // Remove existing event listeners
            const newLeftButton = leftButton.cloneNode(true);
            leftButton.parentNode.replaceChild(newLeftButton, leftButton);
            
            // Add a better scroll handler
            newLeftButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Scroll by a fixed amount, or directly to the first thumbnail if nearly at the beginning
                if (thumbnailsStrip.scrollLeft < 200) {
                    thumbnailsStrip.scrollLeft = 0;
                } else {
                    thumbnailsStrip.scrollLeft -= 200;
                }
                
                if (DEBUG) console.log(`Scrolled left to: ${thumbnailsStrip.scrollLeft}`);
            });
        }
        
        // Improve the right scroll button functionality
        const rightButton = lightbox.querySelector('.thumb-nav-btn.thumb-next');
        if (rightButton) {
            // Remove existing event listeners
            const newRightButton = rightButton.cloneNode(true);
            rightButton.parentNode.replaceChild(newRightButton, rightButton);
            
            // Add a better scroll handler
            newRightButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const maxScroll = thumbnailsStrip.scrollWidth - thumbnailsStrip.clientWidth;
                
                // Scroll by a fixed amount, or to the end if nearly there
                if (thumbnailsStrip.scrollLeft > maxScroll - 200) {
                    thumbnailsStrip.scrollLeft = maxScroll;
                } else {
                    thumbnailsStrip.scrollLeft += 200;
                }
                
                if (DEBUG) console.log(`Scrolled right to: ${thumbnailsStrip.scrollLeft}`);
            });
        }
        
        // Ensure we can see thumbnails including the first one by adjusting CSS
        const thumbnailStyles = document.createElement('style');
        thumbnailStyles.textContent = `
            .lightbox-thumbnails-container {
                padding: 10px 40px;
            }
            
            .lightbox-thumbnails {
                display: flex !important;
                flex-wrap: nowrap !important;
                justify-content: flex-start !important;
                align-items: center !important;
                overflow-x: auto !important;
                scroll-behavior: smooth !important;
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: none !important;
            }
            
            .lightbox-thumbnails::-webkit-scrollbar {
                display: none !important;
            }
            
            .lightbox-thumbnail {
                flex: 0 0 auto !important;
                margin: 0 3px !important;
            }
            
            .lightbox-thumbnail.active {
                border: 2px solid white !important;
                opacity: 1 !important;
            }
            
            .thumb-nav-btn {
                position: absolute !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                z-index: 9999 !important;
                width: 30px !important;
                height: 30px !important;
                background-color: rgba(255, 255, 255, 0.5) !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
            }
            
            .thumb-nav-btn:hover {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .thumb-prev {
                left: 5px !important;
            }
            
            .thumb-next {
                right: 5px !important;
            }
        `;
        
        // Add the styles to the document head
        document.head.appendChild(thumbnailStyles);
        
        // Ensure all thumbnails are visible (fix missing first thumbnail)
        setTimeout(function() {
            // Make sure the first thumbnail is fully visible when at the beginning
            if (activeIndex === 0) {
                thumbnailsStrip.scrollLeft = 0;
            }
            // Otherwise, center the active thumbnail
            else {
                const thumbWidth = activeThumb.offsetWidth + 6; // 6 = 2*3px margin
                const containerWidth = thumbnailsStrip.offsetWidth;
                const scrollPosition = activeThumb.offsetLeft - (containerWidth / 2) + (thumbWidth / 2);
                thumbnailsStrip.scrollLeft = Math.max(0, scrollPosition);
            }
            
            if (DEBUG) console.log(`Final scroll position: ${thumbnailsStrip.scrollLeft}`);
        }, 50);
    }
})();