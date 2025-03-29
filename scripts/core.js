/**
 * Core Website Functionality
 * Initializes all components and handles basic functionality
 */

// Wait for all components to be loaded before initializing
$(document).on('componentsLoaded', function() {
    console.log('componentsLoaded event triggered - initializing website');
    initializeWebsite();
    checkWebPSupport();
});

// Also initialize on document ready to ensure components load even if
// the componentsLoaded event doesn't fire
$(document).ready(function() {
    // Check if componentsLoaded has already been triggered
    if (!window.componentsLoadedFired) {
        console.log('Document ready - initializing components with delay');
        setTimeout(initializeWebsite, 1000);
    }
});

// Also initialize on window load to catch any late-loading resources
$(window).on('load', function() {
    // If componentsLoaded hasn't fired and website isn't initialized yet
    if (!window.componentsLoadedFired && !window.websiteInitialized) {
        console.log('Window load - final initialization attempt');
        initializeWebsite();
    }
});

function initializeWebsite() {
    console.log('Initializing website functionality');
    
    // Set a flag to prevent duplicate initialization
    if (window.websiteInitialized) {
        console.log('Website already initialized, skipping');
        return;
    }
    window.websiteInitialized = true;
    window.componentsLoadedFired = true;

    // Initialize I18n
    if (typeof I18n !== 'undefined') I18n.init();
    
    // Initialize components in specific order
    if (typeof Navigation !== 'undefined') Navigation.init();
    if (typeof Countdown !== 'undefined') Countdown.init();
    
    // Initialize components that need DOM elements to be present
    setTimeout(function() {
        if (typeof Couple !== 'undefined') Couple.init();
        if (typeof Events !== 'undefined') Events.init();
        
        // Initialize Gallery with multiple attempts
        if (typeof Gallery !== 'undefined') {
            console.log('Initializing Gallery');
            Gallery.init();
            
            // Additional safety check - try reinitializing after a delay
            setTimeout(function() {
                console.log('Re-checking Gallery initialization');
                if (typeof Gallery.reinitialize === 'function') {
                    Gallery.reinitialize();
                }
                
                // Force create thumbnails if they don't exist
                ensureGalleryThumbnails();
            }, 1000);
        }
        
        if (typeof RSVP !== 'undefined') RSVP.init();
        
        // Initialize Lightbox last
        if (typeof Lightbox !== 'undefined') Lightbox.init();
        
        // Final check - directly attach click handlers to key elements
        attachAdditionalEventHandlers();
    }, 300);
}

// Function to ensure gallery thumbnails are created
function ensureGalleryThumbnails() {
    // Check if thumbnails exist
    const thumbnailsExist = document.querySelector('.gallery-thumbnails-container');
    if (!thumbnailsExist) {
        console.log('Gallery thumbnails not found, attempting to create them');
        
        // Find active category
        const activeTab = document.querySelector('.gallery-tab.active');
        if (activeTab) {
            const category = activeTab.getAttribute('data-category');
            const galleryContainer = document.getElementById(category);
            
            if (galleryContainer) {
                // Create thumbnails container
                const thumbnailsContainer = document.createElement('div');
                thumbnailsContainer.className = 'gallery-thumbnails-container';
                
                // Insert after gallery tabs
                const tabsContainer = document.querySelector('.gallery-tabs');
                if (tabsContainer && tabsContainer.parentNode) {
                    tabsContainer.parentNode.insertBefore(thumbnailsContainer, tabsContainer.nextSibling);
                    
                    // Force Gallery reinitialization if available
                    if (typeof Gallery !== 'undefined' && typeof Gallery.reinitialize === 'function') {
                        setTimeout(Gallery.reinitialize, 100);
                    }
                }
            }
        }
    }
}

function checkWebPSupport() {
    const testWebP = new Image();
    testWebP.onload = function() {
        // WebP is supported, add class to document
        document.documentElement.classList.add('webp');
    };
    testWebP.onerror = function() {
        // WebP is not supported, use fallback
        document.documentElement.classList.add('no-webp');
    };
    testWebP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
}

function attachAdditionalEventHandlers() {
    console.log('Attaching additional event handlers');
    
    // Ensure couple image has lightbox
    const coupleImage = document.querySelector('.couple-image img');
    if (coupleImage && typeof Lightbox !== 'undefined') {
        console.log('Directly attaching lightbox to couple image');
        coupleImage.style.cursor = 'pointer';
        
        // Remove any existing click events to avoid duplicates
        const newCoupleImage = coupleImage.cloneNode(true);
        if (coupleImage.parentNode) {
            coupleImage.parentNode.replaceChild(newCoupleImage, coupleImage);
        }
        
        // Add fresh click event
        newCoupleImage.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Couple image clicked via direct handler');
            Lightbox.open(this.src, this.alt || 'Couple Image');
        });
    }
    
    // Ensure gallery tabs work
    document.querySelectorAll('.gallery-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('Gallery tab clicked manually:', category);
            
            // Remove active class from all tabs
            document.querySelectorAll('.gallery-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all gallery categories
            document.querySelectorAll('.gallery-category').forEach(cat => {
                cat.classList.remove('active');
            });
            
            // Show the selected category
            const targetCategory = document.getElementById(category);
            if (targetCategory) {
                targetCategory.classList.add('active');
                
                // Force thumbnail recreation after tab switch
                setTimeout(ensureGalleryThumbnails, 100);
            }
        });
    });
}