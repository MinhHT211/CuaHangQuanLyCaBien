/**
 * Enhanced Gallery Browser
 * Adds Facebook-style thumbnail navigation to the photo gallery
 */
const GalleryBrowser = (function() {
    // Configuration
    const MAX_VISIBLE_THUMBS = 10;
    
    // State variables
    let currentCategory = 'engagement'; // Default category
    let currentImageIndex = 0;
    let categoryImages = [];
    let browserContainer = null;
    let thumbnailStrip = null;
    
    function init() {
        console.log('GalleryBrowser.init() called');
        
        // Create browser UI if it doesn't exist
        if (!document.querySelector('.gallery-browser')) {
            createBrowserUI();
        }
        
        // Get references to browser elements
        browserContainer = document.querySelector('.gallery-browser');
        thumbnailStrip = document.querySelector('.gallery-thumbnails');
        
        if (!browserContainer || !thumbnailStrip) {
            console.error('Gallery browser elements not found');
            return;
        }
        
        // Set up event listeners for gallery tabs
        setupTabListeners();
        
        // Initialize with the active tab
        const activeTab = document.querySelector('.gallery-tab.active');
        if (activeTab) {
            currentCategory = activeTab.getAttribute('data-category');
            initializeGalleryImages(currentCategory);
        } else {
            initializeGalleryImages('engagement'); // Default to engagement tab
        }
    }
    
    function createBrowserUI() {
        console.log('Creating gallery browser UI');
        
        const browserHTML = `
            <div class="gallery-browser">
                <div class="gallery-thumbnails-container">
                    <div class="gallery-thumbnails"></div>
                </div>
                <div class="gallery-browser-controls">
                    <button class="browser-prev-btn"><i class="fas fa-chevron-left"></i></button>
                    <button class="browser-next-btn"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        
        // Insert the browser UI after the gallery tabs
        const galleryContainer = document.querySelector('#gallery .container');
        if (galleryContainer) {
            const galleryTabs = galleryContainer.querySelector('.gallery-tabs');
            if (galleryTabs) {
                galleryTabs.insertAdjacentHTML('afterend', browserHTML);
            }
        }
        
        // Add necessary CSS
        const browserStyles = document.createElement('style');
        browserStyles.textContent = `
            .gallery-browser {
                margin: 20px auto;
                position: relative;
                max-width: 1000px;
            }
            
            .gallery-thumbnails-container {
                position: relative;
                margin: 0 auto;
                overflow: hidden;
                background: rgba(0,0,0,0.05);
                border-radius: 8px;
                padding: 10px;
            }
            
            .gallery-thumbnails {
                display: flex;
                transition: transform 0.3s ease;
            }
            
            .gallery-thumbnail {
                width: 80px;
                height: 60px;
                margin: 0 5px;
                cursor: pointer;
                border: 3px solid transparent;
                border-radius: 4px;
                overflow: hidden;
                transition: all 0.2s ease;
                opacity: 0.7;
                flex-shrink: 0;
            }
            
            .gallery-thumbnail.active {
                border-color: var(--primary-color);
                opacity: 1;
            }
            
            .gallery-thumbnail:hover {
                opacity: 1;
            }
            
            .gallery-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .browser-prev-btn, .browser-next-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background-color: rgba(255, 255, 255, 0.7);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.3s ease;
                z-index: 10;
            }
            
            .browser-prev-btn:hover, .browser-next-btn:hover {
                background-color: rgba(255, 255, 255, 0.9);
            }
            
            .browser-prev-btn {
                left: -18px;
            }
            
            .browser-next-btn {
                right: -18px;
            }
            
            @media (max-width: 768px) {
                .gallery-thumbnail {
                    width: 60px;
                    height: 45px;
                    margin: 0 3px;
                }
                
                .browser-prev-btn, .browser-next-btn {
                    width: 30px;
                    height: 30px;
                }
            }
            
            @media (max-width: 480px) {
                .gallery-thumbnail {
                    width: 50px;
                    height: 40px;
                    margin: 0 2px;
                }
            }
        `;
        document.head.appendChild(browserStyles);
    }
    
    function setupTabListeners() {
        // Listen for gallery tab changes
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                currentCategory = category;
                initializeGalleryImages(category);
            });
        });
        
        // Add event listeners for browser controls
        const prevBtn = document.querySelector('.browser-prev-btn');
        const nextBtn = document.querySelector('.browser-next-btn');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', scrollThumbnailsLeft);
            nextBtn.addEventListener('click', scrollThumbnailsRight);
        }
    }
    
    function initializeGalleryImages(category) {
        console.log('Initializing gallery images for category:', category);
        
        // Get all images for the selected category
        const galleryContainer = document.getElementById(category);
        if (!galleryContainer) {
            console.error('Gallery container not found for category:', category);
            return;
        }
        
        // Get all gallery items in this category
        const galleryItems = galleryContainer.querySelectorAll('.gallery-item');
        categoryImages = Array.from(galleryItems);
        currentImageIndex = 0;
        
        // Recreate the thumbnails
        createThumbnails();
        
        // Add click event to gallery items to update the thumbnail navigation
        categoryImages.forEach((item, index) => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Update current index
                currentImageIndex = index;
                
                // Update thumbnail selection
                updateThumbnailSelection();
                
                // If using lightbox, let it handle the display
                const img = item.querySelector('img');
                if (img && typeof Lightbox !== 'undefined') {
                    const src = img.getAttribute('data-full') || img.src;
                    Lightbox.open(src, img.alt, categoryImages, index);
                }
            });
        });
    }
    
    function createThumbnails() {
        if (!thumbnailStrip) return;
        
        // Clear existing thumbnails
        thumbnailStrip.innerHTML = '';
        
        // Create thumbnails for each gallery item
        categoryImages.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                const thumbnailSrc = img.src; // Use the thumbnail version
                
                // Create thumbnail element
                const thumbnail = document.createElement('div');
                thumbnail.className = 'gallery-thumbnail';
                if (index === currentImageIndex) {
                    thumbnail.classList.add('active');
                }
                
                // Create thumbnail image
                const thumbnailImg = document.createElement('img');
                thumbnailImg.src = thumbnailSrc;
                thumbnailImg.alt = img.alt || `Thumbnail ${index + 1}`;
                
                // Add click handler
                thumbnail.addEventListener('click', function() {
                    // Update current index
                    currentImageIndex = index;
                    
                    // Update thumbnail selection
                    updateThumbnailSelection();
                    
                    // Open the image in lightbox
                    if (typeof Lightbox !== 'undefined') {
                        // Check for data-full attribute first, then for WebP support
                        let fullSrc = img.getAttribute('data-full') || img.src;
                        
                        // If using picture element with WebP, check browser support
                        const pictureElem = item.querySelector('picture');
                        if (pictureElem) {
                            const webpSource = pictureElem.querySelector('source[type="image/webp"]');
                            if (webpSource && webpSource.getAttribute('data-srcset')) {
                                // If browser supports WebP, use it; otherwise use fallback
                                if (self.createImageBitmap) {
                                    fullSrc = img.getAttribute('data-full') || webpSource.getAttribute('data-srcset');
                                } else {
                                    fullSrc = img.getAttribute('data-full-fallback') || img.getAttribute('data-src') || img.src;
                                }
                            }
                        }
                        
                        Lightbox.open(fullSrc, img.alt, categoryImages, index);
                    }
                });
                
                // Append to thumbnail strip
                thumbnail.appendChild(thumbnailImg);
                thumbnailStrip.appendChild(thumbnail);
            }
        });
        
        // Position the thumbnails strip to show the current image
        scrollToCurrentThumbnail();
    }
    
    function updateThumbnailSelection() {
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Scroll to make the selected thumbnail visible
        scrollToCurrentThumbnail();
    }
    
    function scrollToCurrentThumbnail() {
        if (!thumbnailStrip) return;
        
        const thumbnailWidth = 90; // Width of thumbnail + margin
        const containerWidth = thumbnailStrip.parentElement.offsetWidth;
        const thumbnailCount = categoryImages.length;
        
        // Calculate visible range
        const visibleCount = Math.min(MAX_VISIBLE_THUMBS, thumbnailCount);
        const maxScroll = Math.max(0, (thumbnailCount - visibleCount) * thumbnailWidth);
        
        // Calculate scroll position to center the current thumbnail
        let scrollPosition = currentImageIndex * thumbnailWidth - (containerWidth / 2) + (thumbnailWidth / 2);
        
        // Constrain scroll position
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
        
        // Apply the scroll
        thumbnailStrip.style.transform = `translateX(-${scrollPosition}px)`;
    }
    
    function scrollThumbnailsLeft() {
        const thumbnailWidth = 90; // Width of thumbnail + margin
        const currentTransform = thumbnailStrip.style.transform;
        let currentScrollX = 0;
        
        if (currentTransform && currentTransform.includes('translateX')) {
            currentScrollX = parseInt(currentTransform.match(/-?\d+/)[0]);
        }
        
        // Scroll by 3 thumbnails, but don't go below 0
        const newScrollX = Math.max(0, currentScrollX - thumbnailWidth * 3);
        thumbnailStrip.style.transform = `translateX(-${newScrollX}px)`;
    }
    
    function scrollThumbnailsRight() {
        const thumbnailWidth = 90; // Width of thumbnail + margin
        const currentTransform = thumbnailStrip.style.transform;
        let currentScrollX = 0;
        
        if (currentTransform && currentTransform.includes('translateX')) {
            currentScrollX = parseInt(currentTransform.match(/-?\d+/)[0]);
        }
        
        const containerWidth = thumbnailStrip.parentElement.offsetWidth;
        const totalWidth = categoryImages.length * thumbnailWidth;
        const maxScroll = Math.max(0, totalWidth - containerWidth);
        
        // Scroll by 3 thumbnails, but don't exceed max
        const newScrollX = Math.min(maxScroll, currentScrollX + thumbnailWidth * 3);
        thumbnailStrip.style.transform = `translateX(-${newScrollX}px)`;
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 500); // Delay initialization to ensure DOM is ready
    });
    
    // Initialize when components are loaded
    document.addEventListener('componentsLoaded', function() {
        setTimeout(init, 1000); // Longer delay for component loading
    });
    
    return {
        init: init,
        scrollThumbnailsLeft: scrollThumbnailsLeft,
        scrollThumbnailsRight: scrollThumbnailsRight
    };
})();