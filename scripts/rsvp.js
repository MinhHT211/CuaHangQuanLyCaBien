/**
 * RSVP form functionality for the wedding website
 */
const RSVP = {
    init: function() {
        const rsvpForm = document.querySelector('.rsvp-form');
        
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Disable the submit button to prevent multiple submissions
                const submitButton = rsvpForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = 'Sending...';
                
                // Get form data
                const name = document.getElementById('name').value;
                const attending = document.querySelector('input[name="attending"]:checked').value;
                const guests = document.getElementById('guests').value;
                const message = document.getElementById('message') ? document.getElementById('message').value : '';
                
                // Create data object to send
                const formData = {
                    name: name,
                    attending: attending,
                    guests: guests,
                    message: message,
                    timestamp: new Date().toISOString()
                };
                
                // Send data to Google Sheets
                this.sendToGoogleSheets(formData, rsvpForm, submitButton);
            });
            
            // Show/hide guests dropdown based on attendance
            const attendingOptions = rsvpForm.querySelectorAll('input[name="attending"]');
            const guestsContainer = document.getElementById('guests-container');
            
            if (attendingOptions.length && guestsContainer) {
                attendingOptions.forEach(option => {
                    option.addEventListener('change', function() {
                        if (this.value === 'yes') {
                            guestsContainer.style.display = 'block';
                        } else {
                            guestsContainer.style.display = 'none';
                        }
                    });
                });
            }
        } else {
            console.warn('RSVP form not found');
        }
    },
    
    sendToGoogleSheets: function(data, form, submitButton) {
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
            
            // Show success message to user
            const successMsg = document.createElement('div');
            successMsg.className = 'form-success-message';
            successMsg.innerHTML = '<p>Thank you for your RSVP! We look forward to celebrating with you.</p>';
            form.appendChild(successMsg);
            
            // Re-enable button after a few seconds
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send RSVP';
            }, 5000);
        })
        .catch(error => {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send RSVP';
            alert('There was an error submitting your RSVP. Please try again.');
        });
    }
};