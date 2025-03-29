/**
 * Enhanced Gallery Browser
 * Adds Facebook-style thumbnail navigation to the photo gallery
 */
(function() {
    // Configuration
    const THUMBNAIL_WIDTH = 55; // pixels
    const THUMBNAIL_HEIGHT = 42; // pixels
    const THUMBNAIL_MARGIN = 2; // pixels
    
    // Track state
    let activeGalleryCategory = '';
    let currentIndex = 0;
    let allGalleryItems = {};
    let isInitialized = false;
    let initAttempts = 0;
    const MAX_INIT_ATTEMPTS = 5;
    
    /**
     * Main initialization function
     */
    function initialize() {
        if (isInitialized) return;
        
        console.log('Initializing gallery thumbnail navigation');
        
        // Find active tab
        const activeTab = document.querySelector('.gallery-tab.active');
        if (activeTab) {
            const category = activeTab.getAttribute('data-category');
            activeGalleryCategory = category;
            
            // Find gallery container
            const galleryContainer = document.getElementById(category);
            if (galleryContainer) {
                // If we have both an active tab and its container, proceed
                setupTabListeners();
                createThumbnailsForActiveCategory(true);
                enhanceLightbox();
                isInitialized = true;
                console.log('Gallery thumbnail navigation initialized successfully');
                return;
            }
        }
        
        // If initialization failed and we haven't reached max attempts, try again
        if (initAttempts < MAX_INIT_ATTEMPTS) {
            initAttempts++;
            console.log(`Gallery initialization attempt ${initAttempts} failed, retrying in 300ms`);
            setTimeout(initialize, 300);
        } else {
            console.warn('Gallery initialization failed after maximum attempts');
        }
    }
    
    /**
     * Set up event listeners for gallery tabs
     */
    function setupTabListeners() {
        const tabs = document.querySelectorAll('.gallery-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                activeGalleryCategory = category;
                
                // Create thumbnails for the category with a slight delay to ensure
                // the gallery container has been updated
                setTimeout(() => {
                    createThumbnailsForActiveCategory(true);
                }, 50);
            });
        });
    }
    
    /**
     * Create thumbnail navigation for active category
     */
    function createThumbnailsForActiveCategory(force = false) {
        if (!activeGalleryCategory) return;
        
        // Find active gallery container
        const galleryContainer = document.getElementById(activeGalleryCategory);
        if (!galleryContainer) return;
        
        // Check if thumbnails already exist
        let thumbnailsContainer = document.querySelector('.gallery-thumbnails-container');
        
        // If we need to force recreation or container doesn't exist
        if (force || !thumbnailsContainer) {
            // Remove existing container if any
            if (thumbnailsContainer) {
                thumbnailsContainer.remove();
            }
            
            // Create new thumbnail container
            thumbnailsContainer = document.createElement('div');
            thumbnailsContainer.className = 'gallery-thumbnails-container';
            
            // Add loading indicator initially
            thumbnailsContainer.innerHTML = '<div class="thumbnail-loading">Loading thumbnails...</div>';
            
            // Insert after gallery tabs
            const tabsContainer = document.querySelector('.gallery-tabs');
            if (tabsContainer && tabsContainer.parentNode) {
                tabsContainer.parentNode.insertBefore(thumbnailsContainer, tabsContainer.nextSibling);
            }
            
            // Collect all gallery items for the category
            const galleryItems = galleryContainer.querySelectorAll('.gallery-item');
            allGalleryItems[activeGalleryCategory] = Array.from(galleryItems);
            
            // Create thumbnails after a short delay (allows DOM to update)
            setTimeout(() => {
                createThumbnails(thumbnailsContainer, allGalleryItems[activeGalleryCategory]);
            }, 50);
        }
    }
    
    /**
     * Create thumbnails in the container
     */
    function createThumbnails(container, galleryItems) {
        if (!container || !galleryItems || !galleryItems.length) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create thumbnail strip
        const thumbnailsStrip = document.createElement('div');
        thumbnailsStrip.className = 'gallery-thumbnails';
        
        // Create navigation buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'thumb-nav-btn thumb-prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.addEventListener('click', () => scrollThumbnails(thumbnailsStrip, -200));
        
        const nextButton = document.createElement('button');
        nextButton.className = 'thumb-nav-btn thumb-next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.addEventListener('click', () => scrollThumbnails(thumbnailsStrip, 200));
        
        // Add buttons and strip to container
        container.appendChild(prevButton);
        container.appendChild(thumbnailsStrip);
        container.appendChild(nextButton);
        
        // Create thumbnails for each gallery item
        galleryItems.forEach((item, index) => {
            const thumbnail = createThumbnail(item, index);
            if (thumbnail) {
                thumbnailsStrip.appendChild(thumbnail);
            }
        });
    }
    
    /**
     * Create an individual thumbnail
     */
    function createThumbnail(galleryItem, index) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'gallery-thumbnail';
        if (index === currentIndex) {
            thumbnail.classList.add('active');
        }
        
        // Ensure we can track which index this thumbnail represents
        thumbnail.dataset.index = index;
        
        // Find the image
        const img = galleryItem.querySelector('img');
        if (!img) return null;
        
        // Get appropriate source for thumbnail
        let thumbSrc = '';
        
        // First try data-src (for lazy loading)
        if (img.hasAttribute('data-src')) {
            thumbSrc = img.getAttribute('data-src');
        } 
        // Try WebP source if available (also for lazy loading)
        else if (galleryItem.querySelector('picture source[type="image/webp"]')) {
            const webpSource = galleryItem.querySelector('picture source[type="image/webp"]');
            if (webpSource.hasAttribute('data-srcset')) {
                thumbSrc = webpSource.getAttribute('data-srcset');
            }
        }
        // Fallback to current src
        else {
            thumbSrc = img.src;
        }
        
        // Create thumbnail image
        const thumbImg = document.createElement('img');
        thumbImg.src = thumbSrc;
        thumbImg.alt = img.alt || `Thumbnail ${index + 1}`;
        
        // Add image to thumbnail
        thumbnail.appendChild(thumbImg);
        
        // Add click handler
        thumbnail.addEventListener('click', function() {
            // Update the current index
            currentIndex = index;
            
            // Update active states
            updateActiveThumbnail();
            
            // Get the gallery item and simulate a click
            const targetGalleryItem = allGalleryItems[activeGalleryCategory][index];
            if (targetGalleryItem) {
                // Find the overlay element to click (which will open the lightbox)
                const overlay = targetGalleryItem.querySelector('.gallery-overlay');
                if (overlay) {
                    overlay.click();
                }
            }
        });
        
        return thumbnail;
    }
    
    /**
     * Update active thumbnail state
     */
    function updateActiveThumbnail() {
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumb, i) => {
            if (i === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Ensure active thumbnail is visible
        const activeThumb = document.querySelector('.gallery-thumbnail.active');
        if (activeThumb) {
            const thumbStrip = document.querySelector('.gallery-thumbnails');
            if (thumbStrip) {
                // Calculate the center position
                const stripWidth = thumbStrip.offsetWidth;
                const thumbWidth = activeThumb.offsetWidth + 2 * THUMBNAIL_MARGIN;
                const thumbsCount = thumbnails.length;
                
                // If there are many thumbnails, ensure the active one is visible
                if (thumbsCount * thumbWidth > stripWidth) {
                    // Calculate the scroll position to center the active thumbnail
                    const scrollPos = activeThumb.offsetLeft - (stripWidth / 2) + (thumbWidth / 2);
                    thumbStrip.scrollLeft = Math.max(0, scrollPos);
                }
            }
        }
    }
    
    /**
     * Scroll thumbnails horizontally
     */
    function scrollThumbnails(strip, amount) {
        if (!strip) return;
        strip.scrollLeft += amount;
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
     * Enhance lightbox functionality
     */
    function enhanceLightbox() {
        if (typeof Lightbox === 'undefined') {
            console.warn('Lightbox not found, cannot enhance.');
            return;
        }
        
        // Store original open function
        const originalOpen = Lightbox.open;
        
        // Override open function to track index and update thumbnails
        Lightbox.open = function(src, alt, items, index) {
            console.log('Enhanced lightbox open with index:', index);
            
            // Update current index
            currentIndex = index || 0;
            
            // Call original function
            originalOpen.call(this, src, alt, items, index);
            
            // Create lightbox thumbnails after a short delay
            setTimeout(() => {
                createLightboxThumbnails(items, index);
                
                // Also update the gallery thumbnails
                updateActiveThumbnail();
                
                // Hide navigation buttons
                hideLightboxNavButtons();
            }, 100);
        };
        
        // Override navigation functions
        if (typeof Lightbox.next === 'function') {
            const originalNext = Lightbox.next;
            Lightbox.next = function() {
                // Call original function
                originalNext.call(this);
                
                // Update current index
                if (currentIndex < allGalleryItems[activeGalleryCategory].length - 1) {
                    currentIndex++;
                    
                    // Update thumbnails
                    updateActiveThumbnail();
                    updateLightboxThumbnails();
                    
                    // Hide navigation buttons
                    hideLightboxNavButtons();
                }
            };
        }
        
        if (typeof Lightbox.prev === 'function') {
            const originalPrev = Lightbox.prev;
            Lightbox.prev = function() {
                // Call original function
                originalPrev.call(this);
                
                // Update current index
                if (currentIndex > 0) {
                    currentIndex--;
                    
                    // Update thumbnails
                    updateActiveThumbnail();
                    updateLightboxThumbnails();
                    
                    // Hide navigation buttons
                    hideLightboxNavButtons();
                }
            };
        }
        
        // Update original close function to potentially refresh thumbnails
        if (typeof Lightbox.close === 'function') {
            const originalClose = Lightbox.close;
            Lightbox.close = function() {
                // Call original function
                originalClose.call(this);
                
                // Force refresh of thumbnails after closing
                setTimeout(() => {
                    createThumbnailsForActiveCategory(true);
                }, 100);
            };
        }
        
        // Handle keyboard navigation
        document.addEventListener('keydown', function(e) {
            // Only if lightbox is active
            if (!document.querySelector('.lightbox.active')) return;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (currentIndex < allGalleryItems[activeGalleryCategory].length - 1) {
                    currentIndex++;
                    updateActiveThumbnail();
                    updateLightboxThumbnails();
                    
                    // Hide navigation buttons
                    hideLightboxNavButtons();
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateActiveThumbnail();
                    updateLightboxThumbnails();
                    
                    // Hide navigation buttons
                    hideLightboxNavButtons();
                }
            }
        });
        
        // Add CSS to hide navigation buttons in lightbox
        if (!document.getElementById('hide-lightbox-nav-style')) {
            const style = document.createElement('style');
            style.id = 'hide-lightbox-nav-style';
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
     * Create thumbnails inside the lightbox
     */
    function createLightboxThumbnails(items, index) {
        // Find the lightbox
        const lightbox = document.querySelector('.lightbox');
        if (!lightbox) return;
        
        // Remove existing thumbnails container if any
        let thumbsContainer = lightbox.querySelector('.lightbox-thumbnails-container');
        if (thumbsContainer) {
            thumbsContainer.remove();
        }
        
        // Create thumbnails container
        thumbsContainer = document.createElement('div');
        thumbsContainer.className = 'lightbox-thumbnails-container';
        
        // Create thumbnails strip
        const thumbsStrip = document.createElement('div');
        thumbsStrip.className = 'lightbox-thumbnails';
        
        // Create navigation buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'thumb-nav-btn thumb-prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.addEventListener('click', () => scrollThumbnails(thumbsStrip, -200));
        
        const nextButton = document.createElement('button');
        nextButton.className = 'thumb-nav-btn thumb-next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.addEventListener('click', () => scrollThumbnails(thumbsStrip, 200));
        
        // Add buttons and strip to container
        thumbsContainer.appendChild(prevButton);
        thumbsContainer.appendChild(thumbsStrip);
        thumbsContainer.appendChild(nextButton);
        
        // Add container to lightbox
        lightbox.appendChild(thumbsContainer);
        
        // Create thumbnails for all gallery items
        items.forEach((item, i) => {
            // Create thumbnail
            const thumb = document.createElement('div');
            thumb.className = 'lightbox-thumbnail';
            if (i === index) {
                thumb.classList.add('active');
            }
            
            // Find image
            const img = item.querySelector('img');
            if (!img) return;
            
            // Get appropriate source
            let thumbSrc = '';
            
            // First try data-src (for lazy loading)
            if (img.hasAttribute('data-src')) {
                thumbSrc = img.getAttribute('data-src');
            } 
            // Try WebP source if available (also for lazy loading)
            else if (item.querySelector('picture source[type="image/webp"]')) {
                const webpSource = item.querySelector('picture source[type="image/webp"]');
                if (webpSource.hasAttribute('data-srcset')) {
                    thumbSrc = webpSource.getAttribute('data-srcset');
                }
            }
            // Fallback to current src
            else {
                thumbSrc = img.src;
            }
            
            // Create thumbnail image
            const thumbImg = document.createElement('img');
            thumbImg.src = thumbSrc;
            thumbImg.alt = img.alt || `Thumbnail ${i + 1}`;
            
            // Add image to thumbnail
            thumb.appendChild(thumbImg);
            
            // Add click handler to switch images
            thumb.addEventListener('click', function() {
                // Get appropriate image source
                let fullSrc = '';
                if (img.hasAttribute('data-full')) {
                    fullSrc = img.getAttribute('data-full');
                } else if (item.querySelector('picture source[type="image/webp"]')) {
                    const webpSource = item.querySelector('picture source[type="image/webp"]');
                    if (webpSource.hasAttribute('data-srcset')) {
                        fullSrc = webpSource.getAttribute('data-srcset');
                    } else {
                        fullSrc = img.src;
                    }
                } else {
                    fullSrc = img.src;
                }
                
                // Update the lightbox image
                const lightboxImg = lightbox.querySelector('.lightbox-img');
                if (lightboxImg) {
                    lightboxImg.src = fullSrc;
                    lightboxImg.alt = img.alt || 'Gallery Image';
                }
                
                // Update current index
                currentIndex = i;
                
                // Update active states
                updateLightboxThumbnails();
                updateActiveThumbnail();
                
                // Hide navigation buttons
                hideLightboxNavButtons();
            });
            
            // Add to strip
            thumbsStrip.appendChild(thumb);
        });
        
        // Scroll to active thumbnail
        setTimeout(function() {
            const activeThumb = thumbsStrip.querySelector('.lightbox-thumbnail.active');
            if (activeThumb) {
                const stripWidth = thumbsStrip.offsetWidth;
                const thumbWidth = activeThumb.offsetWidth + 2 * THUMBNAIL_MARGIN;
                
                const scrollPos = activeThumb.offsetLeft - (stripWidth / 2) + (thumbWidth / 2);
                thumbsStrip.scrollLeft = Math.max(0, scrollPos);
            }
            
            // Hide navigation buttons
            hideLightboxNavButtons();
        }, 50);
    }
    
    /**
     * Update active thumbnail in lightbox
     */
    function updateLightboxThumbnails() {
        const lightboxThumbnails = document.querySelectorAll('.lightbox-thumbnail');
        lightboxThumbnails.forEach((thumb, i) => {
            if (i === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Ensure active thumbnail is visible
        const activeThumb = document.querySelector('.lightbox-thumbnail.active');
        if (activeThumb) {
            const thumbStrip = document.querySelector('.lightbox-thumbnails');
            if (thumbStrip) {
                const stripWidth = thumbStrip.offsetWidth;
                const thumbWidth = activeThumb.offsetWidth + 2 * THUMBNAIL_MARGIN;
                
                const scrollPos = activeThumb.offsetLeft - (stripWidth / 2) + (thumbWidth / 2);
                thumbStrip.scrollLeft = Math.max(0, scrollPos);
            }
        }
        
        // Also update the main gallery image in lightbox
        const lightbox = document.querySelector('.lightbox');
        if (lightbox && allGalleryItems[activeGalleryCategory]) {
            const galleryItem = allGalleryItems[activeGalleryCategory][currentIndex];
            if (galleryItem) {
                const img = galleryItem.querySelector('img');
                if (img) {
                    // Get appropriate image source
                    let fullSrc = '';
                    if (img.hasAttribute('data-full')) {
                        fullSrc = img.getAttribute('data-full');
                    } else if (galleryItem.querySelector('picture source[type="image/webp"]')) {
                        const webpSource = galleryItem.querySelector('picture source[type="image/webp"]');
                        if (webpSource.hasAttribute('data-srcset')) {
                            fullSrc = webpSource.getAttribute('data-srcset');
                        } else {
                            fullSrc = img.src;
                        }
                    } else {
                        fullSrc = img.src;
                    }
                    
                    // Update the lightbox image
                    const lightboxImg = lightbox.querySelector('.lightbox-img');
                    if (lightboxImg) {
                        lightboxImg.src = fullSrc;
                        lightboxImg.alt = img.alt || 'Gallery Image';
                    }
                }
            }
        }
        
        // Hide navigation buttons
        hideLightboxNavButtons();
    }
    
    // Try multiple initialization approaches
    function initializeWithRetries() {
        // First attempt - try immediate initialization
        initialize();
        
        // Second attempt - try after a short delay
        setTimeout(initialize, 500);
        
        // Third attempt - try after DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        }
        
        // Fourth attempt - try after window load
        window.addEventListener('load', initialize);
        
        // Fifth attempt - try after componentsLoaded event
        document.addEventListener('componentsLoaded', function() {
            setTimeout(initialize, 500);
        });
    }
    
    // Start initialization process
    initializeWithRetries();
})();