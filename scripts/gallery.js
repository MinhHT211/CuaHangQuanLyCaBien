/**
 * Gallery Component
 * Handles gallery tabs and interactions
 */
const Gallery = (function() {
    function init() {
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
                    }
                });
            });
            
            // Gallery Lightbox Effect (simplified version)
            const galleryItems = document.querySelectorAll('.gallery-item');
            
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const imgSrc = item.querySelector('img').src;
                    Lightbox.open(imgSrc);
                });
            });
        } else {
            console.warn('Gallery elements not found');
        }
    }
    
    return {
        init: init
    };
})();
