/**
 * Enhanced Lightbox Component with Thumbnail Navigation
 * Extension of the original lightbox.js to support integration with the gallery browser
 */
const EnhancedLightbox = (function() {
    // Store original Lightbox references
    const originalOpen = Lightbox.open;
    const originalClose = Lightbox.close;
    const originalNext = Lightbox.next;
    const originalPrev = Lightbox.prev;
    
    // Track state
    let thumbnailsContainer = null;
    let thumbnailsStrip = null;
    
    function init() {
        console.log('EnhancedLightbox.init() called');
        
        // Make sure the basic Lightbox is initialized
        if (typeof Lightbox !== 'undefined') {
            Lightbox.init();
            
            // Override original methods
            Lightbox.open = enhancedOpen;
            Lightbox.close = enhancedClose;
            Lightbox.next = enhancedNext;
            Lightbox.prev = enhancedPrev;
            
            // Add thumbnails to the lightbox if they don't exist
            ensureThumbnailsExist();
            
            // Add CSS for thumbnails
            addThumbnailStyles();
        } else {
            console.error('Basic Lightbox not found. Cannot enhance.');
        }
    }
    
    function addThumbnailStyles() {
        // Add CSS for thumbnail navigation
        const styles = document.createElement('style');
        styles.textContent = `
            .lightbox-thumbnails-container {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                max-width: 800px;
                height: 80px;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 8px;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2002;
            }
            
            .lightbox-thumbnails {
                display: flex;
                overflow: hidden;
                width: calc(100% - 80px);
                height: 60px;
                transition: transform 0.3s ease;
            }
            
            .lightbox-thumbnail {
                width: 80px;
                height: 60px;
                margin: 0 4px;
                border: 2px solid transparent;
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                flex-shrink: 0;
                transition: all 0.2s ease;
                opacity: 0.6;
            }
            
            .lightbox-thumbnail.active {
                border-color: #ffffff;
                opacity: 1;
            }
            
            .lightbox-thumbnail:hover {
                opacity: 0.9;
            }
            
            .lightbox-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .thumb-scroll-left, .thumb-scroll-right {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.3);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
                z-index: 2003;
            }
            
            .thumb-scroll-left:hover, .thumb-scroll-right:hover {
                background-color: rgba(255, 255, 255, 0.5);
            }
            
            .thumb-scroll-left {
                left: 10px;
            }
            
            .thumb-scroll-right {
                right: 10px;
            }
            
            @media (max-width: 768px) {
                .lightbox-thumbnails-container {
                    height: 60px;
                }
                
                .lightbox-thumbnails {
                    height: 40px;
                }
                
                .lightbox-thumbnail {
                    width: 60px;
                    height: 40px;
                }
            }
            
            @media (max-width: 480px) {
                .lightbox-thumbnails-container {
                    display: none; /* Hide on mobile */
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    function ensureThumbnailsExist() {
        // Check if lightbox exists
        const lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
        if (!lightbox) return;
        
        // Check if thumbnail navigation already exists
        if (lightbox.querySelector('.lightbox-thumbnails')) return;
        
        // Create thumbnail navigation
        const thumbnailsHTML = `
            <div class="lightbox-thumbnails-container">
                <button class="thumb-scroll-left"><i class="fas fa-chevron-left"></i></button>
                <div class="lightbox-thumbnails"></div>
                <button class="thumb-scroll-right"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        // Append thumbnails to lightbox
        lightbox.insertAdjacentHTML('beforeend', thumbnailsHTML);
        
        // Store references
        thumbnailsContainer = lightbox.querySelector('.lightbox-thumbnails-container');
        thumbnailsStrip = lightbox.querySelector('.lightbox-thumbnails');
        
        // Add event listeners to scroll buttons
        const leftBtn = lightbox.querySelector('.thumb-scroll-left');
        const rightBtn = lightbox.querySelector('.thumb-scroll-right');
        
        if (leftBtn && rightBtn) {
            leftBtn.addEventListener('click', scrollThumbnailsLeft);
            rightBtn.addEventListener('click', scrollThumbnailsRight);
        }
    }
    
    function enhancedOpen(src, alt, galleryItems, index) {
        // Call original open method
        originalOpen.call(Lightbox, src, alt, galleryItems, index);
        
        // Update thumbnails if gallery items are provided
        if (galleryItems && galleryItems.length > 0) {
            updateThumbnails(galleryItems, index || 0);
        } else {
            // Hide thumbnails if no gallery
            if (thumbnailsContainer) {
                thumbnailsContainer.style.display = 'none';
            }
        }
    }
    
    function enhancedClose() {
        // Call original close method
        originalClose.call(Lightbox);
        
        // Clear thumbnails
        if (thumbnailsStrip) {
            thumbnailsStrip.innerHTML = '';
        }
    }
    
    function enhancedNext() {
        // Call original next method
        originalNext.call(Lightbox);
        
        // Update active thumbnail
        updateActiveThumbnail();
    }
    
    function enhancedPrev() {
        // Call original prev method
        originalPrev.call(Lightbox);
        
        // Update active thumbnail
        updateActiveThumbnail();
    }
    
    function updateThumbnails(galleryItems, currentIndex) {
        if (!thumbnailsStrip) return;
        
        // Show thumbnails container
        if (thumbnailsContainer) {
            thumbnailsContainer.style.display = 'flex';
        }
        
        // Clear existing thumbnails
        thumbnailsStrip.innerHTML = '';
        
        // Create thumbnails for each gallery item
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                const thumbnailSrc = img.src; // Use the thumbnail version
                
                // Create thumbnail element
                const thumbnail = document.createElement('div');
                thumbnail.className = 'lightbox-thumbnail';
                if (index === currentIndex) {
                    thumbnail.classList.add('active');
                }
                
                // Create thumbnail image
                const thumbnailImg = document.createElement('img');
                thumbnailImg.src = thumbnailSrc;
                thumbnailImg.alt = img.alt || `Thumbnail ${index + 1}`;
                
                // Add click handler
                thumbnail.addEventListener('click', function() {
                    // Get full image src
                    const fullSrc = img.getAttribute('data-full') || img.src;
                    
                    // Open in lightbox
                    originalOpen.call(Lightbox, fullSrc, img.alt, galleryItems, index);
                });
                
                // Append to thumbnail strip
                thumbnail.appendChild(thumbnailImg);
                thumbnailsStrip.appendChild(thumbnail);
            }
        });
        
        // Scroll to current thumbnail
        scrollToActiveThumbnail();
    }
    
    function updateActiveThumbnail() {
        if (!thumbnailsStrip) return;
        
        // Get current index from Lightbox
        const currentIndex = Lightbox.currentIndex;
        if (typeof currentIndex !== 'undefined') {
            // Update active class
            const thumbnails = thumbnailsStrip.querySelectorAll('.lightbox-thumbnail');
            thumbnails.forEach((thumb, index) => {
                if (index === currentIndex) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
            
            // Scroll to make active thumbnail visible
            scrollToActiveThumbnail();
        }
    }
    
    function scrollToActiveThumbnail() {
        if (!thumbnailsStrip) return;
        
        const activeThumbnail = thumbnailsStrip.querySelector('.lightbox-thumbnail.active');
        if (!activeThumbnail) return;
        
        const thumbnailWidth = 88; // Width + margins
        const containerWidth = thumbnailsStrip.offsetWidth;
        
        // Calculate the position to center the active thumbnail
        const activeIndex = Array.from(thumbnailsStrip.children).indexOf(activeThumbnail);
        const totalThumbnails = thumbnailsStrip.children.length;
        
        let scrollPosition = activeIndex * thumbnailWidth - (containerWidth / 2) + (thumbnailWidth / 2);
        
        // Constrain scroll position
        const maxScroll = Math.max(0, totalThumbnails * thumbnailWidth - containerWidth);
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
        
        // Apply scroll
        thumbnailsStrip.style.transform = `translateX(-${scrollPosition}px)`;
    }
    
    function scrollThumbnailsLeft() {
        if (!thumbnailsStrip) return;
        
        const thumbnailWidth = 88; // Width + margins
        const currentTransform = thumbnailsStrip.style.transform;
        let currentScrollX = 0;
        
        if (currentTransform && currentTransform.includes('translateX')) {
            currentScrollX = parseInt(currentTransform.match(/-?\d+/)[0]);
        }
        
        // Scroll by 3 thumbnails, but don't go below 0
        const newScrollX = Math.max(0, currentScrollX - thumbnailWidth * 3);
        thumbnailsStrip.style.transform = `translateX(-${newScrollX}px)`;
    }
    
    function scrollThumbnailsRight() {
        if (!thumbnailsStrip) return;
        
        const thumbnailWidth = 88; // Width + margins
        const currentTransform = thumbnailsStrip.style.transform;
        let currentScrollX = 0;
        
        if (currentTransform && currentTransform.includes('translateX')) {
            currentScrollX = parseInt(currentTransform.match(/-?\d+/)[0]);
        }
        
        const containerWidth = thumbnailsStrip.offsetWidth;
        const totalWidth = thumbnailsStrip.children.length * thumbnailWidth;
        const maxScroll = Math.max(0, totalWidth - containerWidth);
        
        // Scroll by 3 thumbnails, but don't exceed max
        const newScrollX = Math.min(maxScroll, currentScrollX + thumbnailWidth * 3);
        thumbnailsStrip.style.transform = `translateX(-${newScrollX}px)`;
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 1000); // Delay initialization to ensure Lightbox is ready
    });
    
    // Initialize when components are loaded
    document.addEventListener('componentsLoaded', function() {
        setTimeout(init, 1500); // Longer delay for component loading
    });
    
    return {
        init: init
    };
})();