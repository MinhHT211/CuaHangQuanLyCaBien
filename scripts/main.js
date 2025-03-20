/**
 * Wedding Website Main JavaScript File
 * This script handles all interactive functionality for the wedding website
 */

// Wait for all components to be loaded before initializing
$(document).on('componentsLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    console.log('Initializing website functionality');
    
    // Hamburger Menu Toggle
    $('#hamburger').click(function() {
        $('#menu').toggleClass('active');
    });
    
    // Navbar Scroll Effect
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('#navbar').addClass('scrolled');
        } else {
            $('#navbar').removeClass('scrolled');
        }
    });
    
    // Improved Smooth Scrolling for Navigation Links
    $('.nav-link').click(function(e) {
        e.preventDefault();
        
        const targetId = $(this).attr('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Get the position accounting for the navbar
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
            
            // Use native smooth scrolling (better performance in modern browsers)
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if ($('#menu').hasClass('active')) {
                $('#menu').removeClass('active');
            }
        }
    });
    
    // Countdown Timer
    initCountdown();
    
    // RSVP Form Submission
    initRSVPForm();
    
    // Gallery Tabs
    initGalleryTabs();
}

// Countdown Timer Function
function initCountdown() {
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (daysElement && hoursElement && minutesElement && secondsElement) {
        function updateCountdown() {
            const weddingDate = new Date('May 8, 2025 10:30:00').getTime();
            const now = new Date().getTime();
            const timeLeft = weddingDate - now;
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            daysElement.innerHTML = days.toString().padStart(2, '0');
            hoursElement.innerHTML = hours.toString().padStart(2, '0');
            minutesElement.innerHTML = minutes.toString().padStart(2, '0');
            secondsElement.innerHTML = seconds.toString().padStart(2, '0');
        }
        
        // Initial countdown update
        updateCountdown();
        
        // Update countdown every second
        setInterval(updateCountdown, 1000);
    } else {
        console.warn('Countdown elements not found');
    }
}

// RSVP Form Submission
function initRSVPForm() {
    const rsvpForm = document.querySelector('.rsvp-form');
    const formStatus = document.getElementById('form-status');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show loading indicator
            const submitButton = rsvpForm.querySelector('.form-button');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            if (formStatus) {
                formStatus.innerHTML = '<p class="sending">Sending your RSVP...</p>';
                formStatus.style.display = 'block';
            }
            
            // Gather form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                attending: document.querySelector('input[name="attending"]:checked').value,
                guests: document.getElementById('guests').value,
                message: document.getElementById('message').value || 'No message provided'
            };
            
            // Replace this URL with your actual Google Apps Script Web App URL
            const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwxbGYjcETJlI4Pr4OBShq0v36eu83eJEnAwtXErY-ZyzpaYoKyKx7TMOeEBwriiRfaAQ/exec';
            
            // Send data to Google Sheet
            fetch(googleScriptURL, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Success message
                if (formStatus) {
                    formStatus.innerHTML = '<p class="success">Thank you for your RSVP! We look forward to celebrating with you.</p>';
                } else {
                    alert('Thank you for your RSVP! We look forward to celebrating with you.');
                }
                
                rsvpForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }, 3000);
            })
            .catch(error => {
                console.error('Error submitting RSVP:', error);
                
                if (formStatus) {
                    formStatus.innerHTML = '<p class="error">There was an error submitting your RSVP. Please try again later.</p>';
                } else {
                    alert('There was an error submitting your RSVP. Please try again later.');
                }
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    } else {
        console.warn('RSVP form not found');
    }
}

// Gallery Tabs
function initGalleryTabs() {
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
                alert('Lightbox would open here in a fully functional website!');
            });
        });
    } else {
        console.warn('Gallery elements not found');
    }
}