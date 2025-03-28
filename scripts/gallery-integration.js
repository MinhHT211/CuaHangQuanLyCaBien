/**
 * Gallery Integration Script
 * Connects the Gallery Browser and Enhanced Lightbox components
 */
(function() {
    // Function to load scripts dynamically
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        
        script.onload = function() {
            if (callback) callback();
        };
        
        document.head.appendChild(script);
    }
    
    // Function to initialize the gallery enhancements
    function initGalleryEnhancements() {
        console.log('Initializing gallery enhancements');
        
        // Initialize both components
        if (typeof GalleryBrowser !== 'undefined') {
            GalleryBrowser.init();
        } else {
            console.error('GalleryBrowser not loaded');
        }
        
        if (typeof EnhancedLightbox !== 'undefined') {
            EnhancedLightbox.init();
        } else {
            console.error('EnhancedLightbox not loaded');
        }
    }
    
    // Wait for document ready
    document.addEventListener('DOMContentLoaded', function() {
        // Load the scripts in sequence
        loadScript('scripts/gallery-browser.js', function() {
            loadScript('scripts/enhanced-lightbox.js', function() {
                // Initialize after a short delay
                setTimeout(initGalleryEnhancements, 500);
            });
        });
    });
    
    // Also initialize when components are loaded
    document.addEventListener('componentsLoaded', function() {
        // Re-initialize after a delay
        setTimeout(initGalleryEnhancements, 1000);
    });
})();