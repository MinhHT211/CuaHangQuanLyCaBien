# Quốc Việt & Thanh Thủy Wedding Website

A beautiful, responsive wedding website for Quốc Việt & Thanh Thủy's special day.

## Project Structure

```
wedding-website/
│
├── index.html               # Updated to include modular CSS and JS files
│
├── css/
│   ├── base.css             # Core styles, variables, and resets
│   ├── navigation.css       # Navigation styles
│   ├── hero.css             # Hero section and countdown
│   ├── couple.css           # Couple sections (intro and story)
│   ├── events.css           # Event cards and details
│   ├── gallery.css          # Gallery and lightbox
│   ├── rsvp.css             # RSVP form
│   └── footer.css           # Footer styles
│
├── scripts/
│   ├── component-loader.js  # Updated component loader
│   ├── core.js              # Core initialization
│   ├── navigation.js        # Navigation functionality
│   ├── countdown.js         # Countdown timer
│   ├── gallery.js           # Gallery functionality
│   ├── lightbox.js          # Lightbox functionality
│   └── rsvp.js              # RSVP form handling
│
└── components/              # HTML components (nothing changed)
    ├── navbar.html
    ├── home.html
    ├── couple-intro.html
    ├── couple.html
    ├── events.html
    ├── gallery.html
    ├── rsvp.html
    └── footer.html
```

## Setup and Running

1. Install Node.js and npm if you haven't already.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start a local development server.
4. Visit `http://localhost:8080` in your browser.

## Implementation Notes

- The website uses a component-based approach where each section is in its own HTML file.
- Components are loaded dynamically using the `component-loader.js` script.
- The website is designed to be fully responsive and works on all device sizes.
- Image placeholders are used in this version. Replace them with actual photos before deploying.

## Customization

- To change wedding details, edit the relevant HTML components in the `components` folder.
- To customize styles, edit the coressponding .css file in the `css` folder.
- To change functionality, edit the coressponding .js file in the `scripts` folder.

## Deployment

To deploy this website to a production server:

1. Upload all files and folders to your web hosting service.
2. Make sure your hosting service supports serving HTML, CSS, and JavaScript files.
3. If you're using a service that doesn't support client-side includes, you may need to combine all HTML components into a single file.

## Credits

- Fonts: Google Fonts (Dancing Script, Montserrat)
- Icons: Font Awesome 6
- Development: 2025