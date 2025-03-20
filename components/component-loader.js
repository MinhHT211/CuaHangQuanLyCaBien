/**
 * Component Loader for Wedding Website
 * This script handles loading HTML components into the main index.html file
 */

document.addEventListener('DOMContentLoaded', function() {
    // Components to load and their target containers
    const components = [
        { path: 'components/home.html', target: '#home' },
        { path: 'components/couple.html', target: '#couple' },
        { path: 'components/events.html', target: '#events' },
        { path: 'components/gallery.html', target: '#gallery' },
        { path: 'components/rsvp.html', target: '#rsvp' },
        { path: 'components/footer.html', target: '.wed-footer' }
    ];

    // Function to load a component
    function loadComponent(path, targetSelector) {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    targetElement.innerHTML = html;
                } else {
                    console.error(`Target element not found: ${targetSelector}`);
                }
            })
            .catch(error => {
                console.error(`Error loading component: ${error}`);
            });
    }

    // Load all components
    components.forEach(component => {
        loadComponent(component.path, component.target);
    });
});