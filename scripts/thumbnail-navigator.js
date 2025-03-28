/**
 * Enhanced Thumbnail Navigator
 */
(function() {
    // Store thumbnail state
    let currentIndex = 0;
    let galleryItems = [];
    
    // Function to fix issues with the lightbox thumbnails
    function fixLightboxThumbnails() {
        // Find the lightbox element
        const lightbox = document.querySelector('.lightbox');
        if (!lightbox) return;
        
        // Create a reference to the original Lightbox.open function
        const originalOpen = Lightbox.open;
        
        // Override the Lightbox.open function to properly track the active index
        Lightbox.open = function(src, alt, items, index) {
            console.log('Opening lightbox with index:', index);
            
            // Store references to gallery items and current index
            galleryItems = items || [];
            currentIndex = index || 0;
            
            // Store directly on the lightbox element for later reference
            lightbox.__currentIndex = currentIndex;
            lightbox.__galleryItems = galleryItems;
            
            // Call the original open function
            originalOpen.call(this, src, alt, items, index);
            
            // Ensure accurate thumbnail highlighting after a short delay
            setTimeout(function() {
                updateThumbnailHighlights(index);
            }, 100);
        };
        
        // Create an event listener for arrow key navigation to update thumbnails
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'ArrowRight') {
                // Next image
                if (currentIndex < galleryItems.length - 1) {
                    currentIndex++;
                    updateThumbnailHighlights(currentIndex);
                }
            } else if (e.key === 'ArrowLeft') {
                // Previous image
                if (currentIndex > 0) {
                    currentIndex--;
                    updateThumbnailHighlights(currentIndex);
                }
            }
        });
        
        // Add event listeners for the lightbox navigation controls
        const prevButton = lightbox.querySelector('.lightbox-prev');
        const nextButton = lightbox.querySelector('.lightbox-next');
        
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateThumbnailHighlights(currentIndex);
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (currentIndex < galleryItems.length - 1) {
                    currentIndex++;
                    updateThumbnailHighlights(currentIndex);
                }
            });
        }
    }
    
    // Function to update thumbnail highlights based on current index
    function updateThumbnailHighlights(index) {
        const lightboxThumbnails = document.querySelectorAll('.lightbox-thumbnail');
        if (!lightboxThumbnails.length) return;
        
        // Update active class
        lightboxThumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Scroll to make the active thumbnail visible
        const activeThumbnail = Array.from(lightboxThumbnails).find(thumb => thumb.classList.contains('active'));
        if (activeThumbnail) {
            const thumbnailsStrip = document.querySelector('.lightbox-thumbnails');
            if (thumbnailsStrip) {
                const stripRect = thumbnailsStrip.getBoundingClientRect();
                const thumbRect = activeThumbnail.getBoundingClientRect();
                
                // Calculate centered position
                const centerOffset = (stripRect.width / 2) - (thumbRect.width / 2);
                const scrollPosition = activeThumbnail.offsetLeft - centerOffset;
                
                // Apply smooth scroll to the strip
                thumbnailsStrip.style.transition = 'transform 0.3s ease';
                thumbnailsStrip.style.transform = `translateX(-${Math.max(0, scrollPosition)}px)`;
            }
        }
    }
    
    // Function to handle thumbnail click events
    function handleThumbnailClick(event) {
        const thumbnail = event.target.closest('.lightbox-thumbnail');
        if (!thumbnail) return;
        
        const thumbnails = Array.from(document.querySelectorAll('.lightbox-thumbnail'));
        const index = thumbnails.indexOf(thumbnail);
        
        if (index !== -1) {
            // Update current index
            currentIndex = index;
            
            // Update active state on all thumbnails
            updateThumbnailHighlights(index);
            
            // Update the main image
            const lightbox = document.querySelector('.lightbox');
            if (lightbox && lightbox.__galleryItems && lightbox.__galleryItems[index]) {
                const galleryItem = lightbox.__galleryItems[index];
                const img = galleryItem.querySelector('img');
                
                if (img) {
                    // Get appropriate image source
                    let imgSrc = img.getAttribute('data-full') || img.src;
                    
                    // Handle WebP if available
                    const pictureElem = galleryItem.querySelector('picture');
                    if (pictureElem) {
                        const webpSource = pictureElem.querySelector('source[type="image/webp"]');
                        if (webpSource && webpSource.getAttribute('data-srcset')) {
                            // If browser supports WebP, use it; otherwise use fallback
                            const hasWebpSupport = self.createImageBitmap !== undefined;
                            if (hasWebpSupport) {
                                imgSrc = img.getAttribute('data-full') || webpSource.getAttribute('data-srcset');
                            } else {
                                imgSrc = img.getAttribute('data-full-fallback') || img.getAttribute('data-src') || img.src;
                            }
                        }
                    }
                    
                    // Update the lightbox image
                    const lightboxImage = lightbox.querySelector('.lightbox-img');
                    if (lightboxImage) {
                        lightboxImage.src = imgSrc;
                        lightboxImage.alt = img.alt || 'Gallery Image';
                    }
                }
            }
        }
    }
    
    // Initialize event listeners when DOM is loaded
    window.addEventListener('DOMContentLoaded', function() {
        // Set a delay to ensure all other scripts have loaded
        setTimeout(function() {
            fixLightboxThumbnails();
            
            // Add event delegation for thumbnail clicks
            document.addEventListener('click', function(e) {
                handleThumbnailClick(e);
            });
        }, 1000);
    });
    
    // Also initialize when components are loaded
    document.addEventListener('componentsLoaded', function() {
        setTimeout(function() {
            fixLightboxThumbnails();
        }, 1500);
    });
})();