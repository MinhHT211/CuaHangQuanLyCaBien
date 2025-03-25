/**
 * RSVP Component
 * Handles the RSVP form submission
 */
const RSVP = (function() {
    let guestType = 'groom'; // Default guest type
    let messageTimeout; // Store timeout reference
    
    function init() {
        const rsvpForm = document.querySelector('.rsvp-form');
        
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', handleFormSubmit);
            
            // Initialize the first guest option as selected
            const firstGuestOption = document.querySelector('.guest-option');
            if (firstGuestOption) {
                firstGuestOption.classList.add('selected');
            }
            
            // Initialize the first response option as selected and select the radio button
            const firstResponseOption = document.querySelector('.response-option');
            if (firstResponseOption) {
                firstResponseOption.classList.add('selected');
                document.getElementById('attending-yes').checked = true;
            }
            
            // Check if declining option is selected on page load
            const decliningOption = document.querySelector('.response-option:nth-child(2)');
            if (decliningOption && decliningOption.classList.contains('selected')) {
                document.getElementById('guest-count-group').style.display = 'none';
            }
        } else {
            console.warn('RSVP form not found');
        }
    }
    
    function selectGuestType(element, type) {
        // Remove selected class from all options
        document.querySelectorAll('.guest-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        element.classList.add('selected');
        guestType = type; // Store the selected guest type
    }
    
    function selectResponse(element, response) {
        // Remove selected class from all options
        document.querySelectorAll('.response-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        element.classList.add('selected');
        
        // Update the hidden radio button for form submission
        if (response === 'yes') {
            document.getElementById('attending-yes').checked = true;
        } else {
            document.getElementById('attending-no').checked = true;
        }
        
        // Hide or show guest count based on response
        const guestCountGroup = document.getElementById('guest-count-group');
        if (response === 'no') {
            guestCountGroup.style.display = 'none';
        } else {
            guestCountGroup.style.display = 'block';
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form reference
        const form = e.target;
        
        // Disable the submit button to prevent multiple submissions
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        // Get form data
        const name = document.getElementById('name').value;
        const attending = document.querySelector('input[name="attending"]:checked').value;
        const guests = document.getElementById('guests').value;
        const message = document.getElementById('message').value;
        
        // Create data object to send
        const formData = {
            name: name,
            attending: attending,
            guests: attending === 'yes' ? guests : 0, // Set to 0 if declining
            message: message,
            guestType: guestType, // Include the guest type
            timestamp: new Date().toISOString()
        };
        
        // Send data to Google Sheets
        sendToGoogleSheets(formData, form, submitButton);
    }
    
    function sendToGoogleSheets(data, form, submitButton) {
        const sheetsApiUrl = 'https://script.google.com/macros/s/AKfycbzGeglMs_ASOFiHaUFeTsdy8vrk9za2jXmUeLd7knQCkCA8d3J5bLsDkd10eTZOhNKipg/exec';
        
        fetch(sheetsApiUrl, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        })
        .then(() => {
            // Show success message (since no-cors mode doesn't give us response details)
            submitButton.innerHTML = 'Sent!';
            form.reset();
            
            // Reset UI state for new response
            const firstGuestOption = document.querySelector('.guest-option');
            if (firstGuestOption) {
                selectGuestType(firstGuestOption, 'bride');
            }
            
            const firstResponseOption = document.querySelector('.response-option');
            if (firstResponseOption) {
                selectResponse(firstResponseOption, 'yes');
            }
            
            // Remove any existing success messages
            clearAllSuccessMessages();
            
            // If there's an existing timeout, clear it
            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
            
            // Show appropriate success message based on attending status
            const successMsg = document.createElement('div');
            successMsg.className = 'form-success-message';
            
            if (data.attending === 'yes') {
                successMsg.innerHTML = '<p>Thank you for your RSVP! We look forward to celebrating with you.</p>';
            } else {
                successMsg.innerHTML = '<p>Thank you for letting us know you cannot attend. We will miss you!</p>';
            }
            
            // Add custom styling to the message
            successMsg.style.padding = '15px';
            successMsg.style.marginTop = '20px';
            successMsg.style.backgroundColor = '#f0f9f0';
            successMsg.style.borderLeft = '4px solid #4CAF50';
            successMsg.style.borderRadius = '4px';
            successMsg.style.opacity = '1';
            successMsg.style.transition = 'opacity 1.5s ease-out';
            
            form.appendChild(successMsg);
            
            // Set timeout to fade out the message after 5 seconds
            messageTimeout = setTimeout(() => {
                if (successMsg && successMsg.parentNode) {
                    // Start fading out
                    successMsg.style.opacity = '0';
                    
                    // Remove from DOM after fade completes
                    setTimeout(() => {
                        if (successMsg && successMsg.parentNode) {
                            successMsg.remove();
                        }
                    }, 1500); // This matches the transition duration
                }
            }, 5000);
            
            // Re-enable button after a few seconds
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send RSVP';
            }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send RSVP';
            alert('There was an error submitting your RSVP. Please try again.');
        });
    }
    
    // Helper function to clear all success messages
    function clearAllSuccessMessages() {
        const messages = document.querySelectorAll('.form-success-message');
        messages.forEach(msg => msg.remove());
    }
    
    return {
        init: init,
        selectGuestType: selectGuestType,
        selectResponse: selectResponse
    };
})();