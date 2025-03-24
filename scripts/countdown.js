/**
 * Countdown Component
 * Handles the wedding countdown timer
 */
const Countdown = (function() {
    function init() {
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
    
    return {
        init: init
    };
})();