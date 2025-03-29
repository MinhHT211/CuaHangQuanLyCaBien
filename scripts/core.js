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

// Also initialize thumbnails on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize thumbnails after a delay
    setTimeout(initializeThumbnails, 800);
});

// Make sure thumbnails are initialized when window is fully loaded
window.addEventListener('load', function() {
    setTimeout(initializeThumbnails, 300);
    
    // Final fallback check for thumbnails
    setTimeout(function() {
        const galleryThumbnails = document.querySelector('.gallery-thumbnails-container');
        if (!galleryThumbnails && typeof window.createThumbnailsForActiveCategory === 'function') {
            console.log('Window load - final thumbnail creation attempt');
            window.createThumbnailsForActiveCategory(true);
        }
    }, 1500);
});

function initializeWebsite() {
    console.log('Initializing website functionality');

    // Initialize I18n
    if (typeof I18n !== 'undefined') I18n.init();
    
    // Initialize components in specific order
    if (typeof Navigation !== 'undefined') Navigation.init();
    if (typeof Countdown !== 'undefined') Countdown.init();
    
    // Initialize components that need DOM elements to be present
    setTimeout(function() {
        if (typeof Couple !== 'undefined') Couple.init();
        if (typeof Events !== 'undefined') Events.init();
        if (typeof Gallery !== 'undefined') Gallery.init();
        if (typeof RSVP !== 'undefined') RSVP.init();
        
        // Initialize Lightbox last
        if (typeof Lightbox !== 'undefined') Lightbox.init();
        
        // Final check - directly attach click handlers to key elements
        attachAdditionalEventHandlers();
        
        // Initialize thumbnails after components are loaded
        setTimeout(initializeThumbnails, 500);
    }, 300);
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
                
                // Create thumbnails for the selected category after tab change
                setTimeout(function() {
                    if (typeof window.createThumbnailsForActiveCategory === 'function') {
                        window.createThumbnailsForActiveCategory(true);
                    }
                }, 100);
            }
        });
    });
    
    // Add event listener for gallery items to ensure lightbox thumbnails are created
    document.addEventListener('click', function(e) {
        // When clicking a gallery item
        if (e.target.closest('.gallery-item') || e.target.closest('.gallery-overlay')) {
            // Wait for lightbox to open
            setTimeout(function() {
                // If lightbox is open but no thumbnails
                const lightbox = document.querySelector('.lightbox.active');
                if (lightbox && !lightbox.querySelector('.lightbox-thumbnails-container')) {
                    console.log('Core: Lightbox opened, ensuring thumbnails are created');
                    
                    // Get gallery items from active category
                    const activeCategory = document.querySelector('.gallery-category.active');
                    if (activeCategory) {
                        const galleryItems = activeCategory.querySelectorAll('.gallery-item');
                        
                        // Find the clicked item
                        const clickedItem = e.target.closest('.gallery-item');
                        let currentIndex = 0;
                        
                        if (clickedItem) {
                            currentIndex = Array.from(galleryItems).indexOf(clickedItem);
                        }
                        
                        // Create thumbnails
                        if (typeof window.createLightboxThumbnails === 'function') {
                            window.createLightboxThumbnails(Array.from(galleryItems), currentIndex);
                        }
                    }
                }
            }, 300);
        }
    });
}

/**
 * Initialize thumbnails for both gallery and lightbox
 */
function initializeThumbnails() {
    console.log('Core: Initializing thumbnails');
    
    // For gallery thumbnails
    if (typeof window.createThumbnailsForActiveCategory === 'function') {
        console.log('Core: Creating gallery thumbnails');
        window.createThumbnailsForActiveCategory(true);
    } else {
        console.log('Core: Gallery thumbnail function not available yet');
        
        // Try again in a moment if Gallery module isn't initialized yet
        setTimeout(function() {
            if (typeof window.createThumbnailsForActiveCategory === 'function') {
                console.log('Core: Retry creating gallery thumbnails');
                window.createThumbnailsForActiveCategory(true);
            }
        }, 500);
    }
    
    // Hide navigation buttons in the lightbox if it's open
    const lightbox = document.querySelector('.lightbox.active');
    if (lightbox && typeof Lightbox !== 'undefined' && Lightbox.hideNavigationButtons) {
        Lightbox.hideNavigationButtons();
    }
}

// Expose the initialization function globally so it can be called from other scripts
window.initializeThumbnails = initializeThumbnails;