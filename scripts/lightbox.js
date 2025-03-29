/**
 * Lightbox Component
 * Handles lightbox functionality for all images across the website
 */
const Lightbox = (function() {
	let lightbox;
	let lightboxImage;
	let lightboxClose;
	let currentGalleryItems = [];
	let currentIndex = 0;
	let isLoading = false;
	let isInitialized = false;
	let thumbnailCreateAttempts = 0;
	const MAX_THUMBNAIL_ATTEMPTS = 5;
	
	function init() {
		console.log('Lightbox.init() called');
		
		if (isInitialized) {
			console.log('Lightbox already initialized, skipping');
			return;
		}
		
		// First, create the lightbox HTML structure if it doesn't exist
		if (!document.querySelector('.lightbox')) {
			createLightboxElement();
		}
		
		// Get lightbox elements
		lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
		lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
		lightboxClose = document.querySelector('.lightbox-close');
		
		if (!lightbox || !lightboxImage || !lightboxClose) {
			console.warn('Lightbox elements not found, creating them');
			createLightboxElement();
			
			// Try to get elements again
			lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
			lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
			lightboxClose = document.querySelector('.lightbox-close');
			
			if (!lightbox || !lightboxImage || !lightboxClose) {
				console.error('Still could not find lightbox elements');
				return;
			}
		}
		
		// Add event listener to close button
		lightboxClose.addEventListener('click', close);
		
		// Add event listener to close when clicking outside the image
		lightbox.addEventListener('click', function(e) {
			if (e.target === lightbox) {
				close();
			}
		});
		
		// Add keyboard event to close on ESC key and navigate with arrow keys
		document.addEventListener('keydown', function(e) {
			if (!lightbox.classList.contains('active')) return;
			
			switch (e.key) {
				case 'Escape':
					close();
					break;
				case 'ArrowLeft':
					prev();
					break;
				case 'ArrowRight':
					next();
					break;
			}
		});
		
		// Add global event listener for images
		document.addEventListener('click', function(e) {
			// Direct couple image click handler
			if (e.target.matches('.couple-image img')) {
				console.log('Couple image clicked via global handler');
				e.preventDefault();
				e.stopPropagation();
				open(e.target.src, e.target.alt || 'Couple Image');
			}
		});
		
		// Setup triggers for static elements
		setupLightboxTriggers();
		
		// Add CSS to hide navigation buttons in lightbox when it's open
		addHideNavigationStyle();
		
		// Mark as initialized
		isInitialized = true;
		console.log('Lightbox initialized successfully');
	}
	
	function createLightboxElement() {
		console.log('Creating lightbox element');
		const lightboxHtml = `
			<div class="lightbox" id="gallery-lightbox">
				<span class="lightbox-close">&times;</span>
				<div class="lightbox-nav lightbox-prev">
					<i class="fas fa-chevron-left"></i>
				</div>
				<div class="lightbox-content">
					<div class="lightbox-loading">
						<div class="spinner"></div>
						<div>Loading...</div>
					</div>
					<img src="" alt="Gallery Image" class="lightbox-img" id="lightbox-image">
				</div>
				<div class="lightbox-nav lightbox-next">
					<i class="fas fa-chevron-right"></i>
				</div>
			</div>
		`;
		
		document.body.insertAdjacentHTML('beforeend', lightboxHtml);
	}
	
	function setupLightboxTriggers() {
		console.log('Setting up lightbox triggers');
		
		// Add click events to all portrait images in couple-intro section
		const portraitImages = document.querySelectorAll('.portrait-img');
		portraitImages.forEach(img => {
			img.style.cursor = 'pointer'; // Make it clear they're clickable
			img.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				open(this.src, this.alt || 'Portrait Image');
			});
		});
		
		// Add click event to couple image
		const coupleImage = document.querySelector('.couple-image img');
		if (coupleImage) {
			console.log('Found couple image in setupLightboxTriggers');
			coupleImage.style.cursor = 'pointer';
			coupleImage.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				console.log('Couple image clicked in setupLightboxTriggers');
				open(this.src, this.alt || 'Couple Image');
			});
		} else {
			console.warn('Couple image not found in setupLightboxTriggers');
		}
	}
	
	function addHideNavigationStyle() {
		// Create a style element to hide navigation buttons when lightbox is active
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
	
	function hideNavigationButtons() {
		const navButtons = document.querySelectorAll('.lightbox-prev, .lightbox-next, .lightbox-nav');
		navButtons.forEach(button => {
			button.style.display = 'none';
			button.style.visibility = 'hidden';
			button.style.opacity = '0';
			button.style.pointerEvents = 'none';
		});
	}
	
	function ensureLightboxThumbnails(items, index, attempt = 0) {
		// Check if there are already thumbnails
		const lightboxThumbnailsContainer = lightbox.querySelector('.lightbox-thumbnails-container');
		
		// If no thumbnails and we have the createLightboxThumbnails function available
		if (!lightboxThumbnailsContainer) {
			console.log(`Creating lightbox thumbnails (attempt ${attempt + 1}/${MAX_THUMBNAIL_ATTEMPTS})`);
			
			// Try to create thumbnails through the gallery-thumbnail.js if it's available
			if (typeof window.createLightboxThumbnails === 'function') {
				window.createLightboxThumbnails(items, index);
			} else if (typeof createLightboxThumbnails === 'function') {
				createLightboxThumbnails(items, index);
			} else {
				console.warn('createLightboxThumbnails function not found');
			}
			
			// Check if thumbnails were created
			const thumbnailsContainer = lightbox.querySelector('.lightbox-thumbnails-container');
			if (!thumbnailsContainer && attempt < MAX_THUMBNAIL_ATTEMPTS) {
				// If not, try again with exponential backoff
				const delay = Math.pow(2, attempt) * 100; // 100, 200, 400, 800, 1600ms
				console.log(`Lightbox thumbnails not created, retrying in ${delay}ms`);
				
				setTimeout(() => {
					ensureLightboxThumbnails(items, index, attempt + 1);
				}, delay);
			}
		} else {
			console.log('Lightbox thumbnails already exist');
		}
	}
	
	function open(src, alt = 'Gallery Image', galleryItems = [], index = 0) {
		console.log('Lightbox.open() called for:', src);
		
		if (isLoading) {
			console.log('Still loading previous image, skipping');
			return;
		}
		isLoading = true;
		
		// Safety timeout - reset loading state after 5 seconds no matter what
		const safetyTimeout = setTimeout(() => {
			if (isLoading) {
				console.log('Safety timeout reached, resetting loading state');
				isLoading = false;
			}
		}, 5000);
		
		// Make sure lightbox is initialized
		if (!isInitialized) {
			init();
		}
		
		// Store current gallery items and index for navigation
		currentGalleryItems = galleryItems;
		currentIndex = index;
		
		// Remove any existing event listeners to prevent duplicates
		if (lightboxImage) {
			lightboxImage.onload = null;
			lightboxImage.onerror = null;
		}
	
		// Handle WebP with fallback - check if src is a WebP image, use fallback if needed
		// Check if the browser supports WebP
		const isSrcWebP = src.toLowerCase().endsWith('.webp');
		const imgElement = galleryItems.length > 0 ? 
			galleryItems[index].querySelector('img') : null;
		
		// If current source is WebP and we have a fallback available and browser might not support WebP
		if (isSrcWebP && imgElement && imgElement.hasAttribute('data-full-fallback')) {
			// We'll first try with WebP, but have fallback ready
			console.log('WebP image with fallback available');
			const fallbackSrc = imgElement.getAttribute('data-full-fallback');
			
			// We'll set up the error handler to use fallback if WebP fails
			lightboxImage.onerror = function() {
				console.log('WebP failed to load, trying fallback:', fallbackSrc);
				lightboxImage.onerror = function() {
					console.error('Fallback image also failed to load:', fallbackSrc);
					clearTimeout(safetyTimeout);
					isLoading = false;
					// Display an error message
					const loadingIndicator = document.querySelector('.lightbox-loading');
					if (loadingIndicator) {
						loadingIndicator.innerHTML = '<div class="error-message">Failed to load image</div>';
					}
				};
				
				// Try the fallback
				lightboxImage.src = fallbackSrc;
			};
		} else {
			// Handle load errors for non-WebP images
			lightboxImage.onerror = function() {
				console.error('Error loading image:', src);
				clearTimeout(safetyTimeout);
				isLoading = false;
				// Display an error message
				const loadingIndicator = document.querySelector('.lightbox-loading');
				if (loadingIndicator) {
					loadingIndicator.innerHTML = '<div class="error-message">Failed to load image</div>';
				}
			};
		}
		
		// Set image source and alt
		lightboxImage.src = "";  // Clear the source first
		lightboxImage.alt = alt;
		lightboxImage.classList.remove('loaded');
		
		// Show loading indicator
		const loadingIndicator = document.querySelector('.lightbox-loading');
		if (loadingIndicator) loadingIndicator.style.display = 'block';
		
		// When image is loaded, hide loading indicator and show image
		lightboxImage.onload = function() {
			console.log('Lightbox image loaded');
			// Clear the safety timeout since image loaded successfully
			clearTimeout(safetyTimeout);
			
			// Hide loading indicator
			const loadingIndicator = document.querySelector('.lightbox-loading');
			if (loadingIndicator) loadingIndicator.style.display = 'none';
			
			// Show image
			lightboxImage.classList.add('loaded');
			isLoading = false;
			
			// Hide navigation buttons
			hideNavigationButtons();
			
			// Ensure lightbox thumbnails are created
			if (galleryItems.length > 0) {
				// Reset attempt counter
				thumbnailCreateAttempts = 0;
				
				// Try creating thumbnails with multiple attempts
				ensureLightboxThumbnails(galleryItems, index);
				
				// Also try again after a longer delay as a backup
				setTimeout(() => {
					const thumbnailsContainer = lightbox.querySelector('.lightbox-thumbnails-container');
					if (!thumbnailsContainer) {
						console.log('Second attempt to create lightbox thumbnails');
						ensureLightboxThumbnails(galleryItems, index);
					}
				}, 500);
			}
		};
		
		// Show lightbox
		lightbox.classList.add('active');
		
		// Prevent page scrolling when lightbox is open
		document.body.style.overflow = 'hidden';
		
		// Hide navigation buttons immediately
		hideNavigationButtons();
		
		// Set up navigation buttons (they'll be hidden but still functional for keyboard nav)
		const prevButton = document.querySelector('.lightbox-prev');
		const nextButton = document.querySelector('.lightbox-next');
		
		if (prevButton) prevButton.addEventListener('click', prev);
		if (nextButton) nextButton.addEventListener('click', next);
		
		// Important: Set the src AFTER setting up the event handlers
		setTimeout(() => {
			lightboxImage.src = src;
		}, 50);
		
		// Make sure navigation buttons stay hidden by checking again
		setTimeout(hideNavigationButtons, 200);
		setTimeout(hideNavigationButtons, 500);
	}
	
	function close() {
		console.log('Lightbox.close() called');
		if (!lightbox) return;
		
		// IMPORTANT - Reset loading flag immediately when closing
		isLoading = false;
		
		// Hide lightbox
		lightbox.classList.remove('active');
		
		// Re-enable page scrolling
		document.body.style.overflow = '';
		
		// Clear image source after transition
		setTimeout(() => {
			if (lightboxImage) {
				lightboxImage.src = '';
				lightboxImage.classList.remove('loaded');
			}
		}, 300);
		
		// Remove navigation event listeners
		const prevButton = document.querySelector('.lightbox-prev');
		const nextButton = document.querySelector('.lightbox-next');
		
		if (prevButton) prevButton.removeEventListener('click', prev);
		if (nextButton) nextButton.removeEventListener('click', next);
	}
	
	function prev() {
		if (currentIndex > 0 && currentGalleryItems.length > 0 && !isLoading) {
			currentIndex--;
			const prevItem = currentGalleryItems[currentIndex];
			const img = prevItem.querySelector('img');
			if (img) {
				const src = img.getAttribute('data-full') || img.src;
				open(src, img.alt, currentGalleryItems, currentIndex);
			}
		}
	}
	
	function next() {
		if (currentIndex < currentGalleryItems.length - 1 && !isLoading) {
			currentIndex++;
			const nextItem = currentGalleryItems[currentIndex];
			const img = nextItem.querySelector('img');
			if (img) {
				const src = img.getAttribute('data-full') || img.src;
				open(src, img.alt, currentGalleryItems, currentIndex);
			}
		}
	}
	
	// Expose createLightboxThumbnails globally if it doesn't exist
	if (typeof window.createLightboxThumbnails !== 'function') {
		window.createLightboxThumbnails = function(items, index) {
			console.log('Creating lightbox thumbnails (from Lightbox module)');
			
			// Find the lightbox
			if (!lightbox) {
				console.warn('Lightbox not found for thumbnail creation');
				return;
			}
			
			// Remove existing thumbnails container
			const existingContainer = lightbox.querySelector('.lightbox-thumbnails-container');
			if (existingContainer) {
				existingContainer.remove();
			}
			
			// Create thumbnails container
			const thumbsContainer = document.createElement('div');
			thumbsContainer.className = 'lightbox-thumbnails-container';
			
			// Create thumbnails strip
			const thumbsStrip = document.createElement('div');
			thumbsStrip.className = 'lightbox-thumbnails';
			
			// Create navigation buttons
			const prevButton = document.createElement('button');
			prevButton.className = 'thumb-nav-btn thumb-prev';
			prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
			prevButton.style.display = 'none'; // Hide nav buttons
			
			const nextButton = document.createElement('button');
			nextButton.className = 'thumb-nav-btn thumb-next';
			nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
			nextButton.style.display = 'none'; // Hide nav buttons
			
			// Add the strip to container (with or without nav buttons)
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
					if (lightboxImage) {
						lightboxImage.src = fullSrc;
						lightboxImage.alt = img.alt || 'Gallery Image';
					}
					
					// Update current index
					currentIndex = i;
					
					// Update active thumbnails
					const allThumbs = thumbsStrip.querySelectorAll('.lightbox-thumbnail');
					allThumbs.forEach((t, idx) => {
						if (idx === i) {
							t.classList.add('active');
						} else {
							t.classList.remove('active');
						}
					});
					
					// Ensure the active thumbnail is visible
					setTimeout(() => {
						const activeThumb = thumbsStrip.querySelector('.lightbox-thumbnail.active');
						if (activeThumb) {
							const stripWidth = thumbsStrip.offsetWidth;
							const thumbWidth = activeThumb.offsetWidth + 4; // 4px margin
							
							const scrollPos = activeThumb.offsetLeft - (stripWidth / 2) + (thumbWidth / 2);
							thumbsStrip.scrollLeft = Math.max(0, scrollPos);
						}
					}, 50);
				});
				
				// Add to strip
				thumbsStrip.appendChild(thumb);
			});
			
			// Ensure active thumbnail is visible
			setTimeout(() => {
				const activeThumb = thumbsStrip.querySelector('.lightbox-thumbnail.active');
				if (activeThumb) {
					const stripWidth = thumbsStrip.offsetWidth;
					const thumbWidth = activeThumb.offsetWidth + 4; // 4px margin
					
					const scrollPos = activeThumb.offsetLeft - (stripWidth / 2) + (thumbWidth / 2);
					thumbsStrip.scrollLeft = Math.max(0, scrollPos);
				}
			}, 100);
			
			// Hide navigation buttons in lightbox
			hideNavigationButtons();
			
			return thumbsContainer;
		};
	}
	
	// Initialize on DOM ready
	document.addEventListener('DOMContentLoaded', function() {
		setTimeout(init, 100); // Short delay to ensure DOM is ready
	});
	
	// Initialize when components are loaded
	document.addEventListener('componentsLoaded', function() {
		setTimeout(function() {
			init();
			// Re-setup triggers to catch newly loaded components
			setupLightboxTriggers();
		}, 500); // Longer delay for component loading
	});
	
	// Make sure lightbox is initialized when the window loads
	window.addEventListener('load', function() {
		if (!isInitialized) {
			console.log('Window load - initializing lightbox');
			init();
		}
	});
	
	return {
		init: init,
		open: open,
		close: close,
		prev: prev,
		next: next,
		setupTriggers: setupLightboxTriggers,
		hideNavigationButtons: hideNavigationButtons,
		createLightboxThumbnails: window.createLightboxThumbnails
	};
})();