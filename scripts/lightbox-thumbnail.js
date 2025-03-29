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
                setTimeout(function() {
                    fixLightboxThumbnails();
                    hideLightboxNavButtons();
                }, 200);
            }
        });
        
        // Also add listener for lightbox navigation buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.lightbox-prev') || e.target.closest('.lightbox-next')) {
                // Wait for image to change
                setTimeout(function() {
                    fixLightboxThumbnails();
                    hideLightboxNavButtons();
                }, 100);
            }
        });
        
        // Add keyboard navigation enhancement
        document.addEventListener('keydown', function(e) {
            const lightbox = document.querySelector('.lightbox.active');
            if (!lightbox) return;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // Wait for image to change
                setTimeout(function() {
                    fixLightboxThumbnails();
                    hideLightboxNavButtons();
                }, 100);
            }
        });
        
        // Add style to hide lightbox navigation buttons
        addLightboxNavHideStyle();
    }
    
    /**
     * Hide lightbox navigation buttons
     */
    function hideLightboxNavButtons() {
        const lightbox = document.querySelector('.lightbox.active');
        if (!lightbox) return;
        
        const navButtons = lightbox.querySelectorAll('.lightbox-prev, .lightbox-next, .lightbox-nav');
        navButtons.forEach(button => {
            button.style.display = 'none';
            button.style.visibility = 'hidden';
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
        });
    }
    
    /**
     * Add style to hide lightbox navigation buttons
     */
    function addLightboxNavHideStyle() {
        if (!document.getElementById('hide-lightbox-nav-buttons')) {
            const style = document.createElement('style');
            style.id = 'hide-lightbox-nav-buttons';
            style.textContent = `
                .lightbox.active .lightbox-prev,
                .lightbox.active .lightbox-next,
                .lightbox.active .lightbox-nav {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `;
            document.head.appendChild(style);
        }
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
                hideLightboxNavButtons();
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
        
        // Make navigation buttons in lightbox hidden
        hideLightboxNavButtons();
        
        // Ensure we can see thumbnails including the first one by adjusting CSS
        const thumbnailStyles = document.createElement('style');
        thumbnailStyles.textContent = `
            .lightbox-thumbnails-container {
                padding: 10px 10px;
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
                height: 4px;
                background: rgba(0, 0, 0, 0.1);
            }
            
            .lightbox-thumbnails::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            .lightbox-thumbnail {
                flex: 0 0 auto !important;
                margin: 0 3px !important;
            }
            
            .lightbox-thumbnail.active {
                border: 2px solid white !important;
                opacity: 1 !important;
            }
        `;
        
        // Add the styles to the document head if not already there
        if (!document.getElementById('lightbox-thumbnail-styles')) {
            thumbnailStyles.id = 'lightbox-thumbnail-styles';
            document.head.appendChild(thumbnailStyles);
        }
        
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
            
            // Make sure navigation buttons stay hidden
            hideLightboxNavButtons();
        }, 50);
    }
})();