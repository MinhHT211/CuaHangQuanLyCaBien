/**
 * Core Website Functionality
 * Initializes all components and handles basic functionality
 */

// Wait for all components to be loaded before initializing
$(document).on('componentsLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    console.log('Initializing website functionality');
    
    // Initialize all components
    Navigation.init();
    Countdown.init();
    RSVP.init();
    Gallery.init();
    Lightbox.init();
}
