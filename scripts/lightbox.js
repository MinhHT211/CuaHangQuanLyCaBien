/**
 * Lightbox Component
 * Handles lightbox functionality for images
 */
const Lightbox = (function() {
    function init() {
        // First, create the lightbox HTML structure if it doesn't exist
        if (!document.querySelector('.lightbox')) {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-close">&times;</div>
                <div class="lightbox-content">
                    <img src="" alt="Fullscreen Image" class="lightbox-img">
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // Add click event to close the lightbox
            const closeBtn = lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', function() {
                lightbox.classList.remove('active');
                document.body.style.overflow = "auto"; // Re-enable scrolling
            });
            
            // Close lightbox when clicking outside the image
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = "auto"; // Re-enable scrolling
                }
            });
            
            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = "auto"; // Re-enable scrolling
                }
            });
        }
        
        // Get all images that should trigger the lightbox
        setupLightboxTriggers();
    }
    
    function setupLightboxTriggers() {
        // Add click events to all portrait images in couple-intro section
        const portraitImages = document.querySelectorAll('.portrait-img');
        portraitImages.forEach(img => {
            img.addEventListener('click', function() {
                open(this.src);
            });
            
            // Add cursor pointer style to make it clear they're clickable
            img.style.cursor = 'pointer';
        });
        
        // Add click event to couple image
        const coupleImage = document.querySelector('.couple-image img');
        if (coupleImage) {
            coupleImage.addEventListener('click', function() {
                open(this.src);
            });
        }
        
        // Add click events to all gallery images
        const galleryImages = document.querySelectorAll('.gallery-item img');
        galleryImages.forEach(img => {
            img.addEventListener('click', function(e) {
                e.preventDefault();
                open(this.src);
            });
        });
    }
    
    function open(imageSrc) {
        const lightbox = document.querySelector('.lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        
        if (lightbox && lightboxImg) {
            lightboxImg.src = imageSrc;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        }
    }
    
    return {
        init: init,
        open: open
    };
})();
