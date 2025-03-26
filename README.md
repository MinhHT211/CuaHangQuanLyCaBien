# Quốc Việt & Thanh Thủy Wedding Website

A beautiful, responsive wedding website for Quốc Việt & Thanh Thủy's special day.

## Project Structure

```
wedding-website/
│
├── index.html               # Main HTML file with component placeholders
│
├── css/
│   ├── base.css             # Core styles, variables, and resets
│   ├── navigation.css       # Navigation styles
│   ├── hero.css             # Hero section and countdown
│   ├── couple.css           # Couple sections (intro and story)
│   ├── events.css           # Event cards and details
│   ├── gallery.css          # Gallery styles
│   ├── lightbox.css         # Lightbox styling
│   ├── rsvp.css             # RSVP form styles
│   └── footer.css           # Footer styles
│
├── scripts/
│   ├── component-loader.js  # Dynamic component loading
│   ├── i18n.js  			 # International translation
│   ├── core.js              # Core website initialization
│   ├── navigation.js        # Navigation functionality
│   ├── countdown.js         # Countdown timer
│   ├── gallery.js           # Gallery management
│   ├── lightbox.js          # Image lightbox functionality
│   ├── couple.js            # Couple section interactions
│   ├── events.js            # Events section functionality
│   └── rsvp.js              # RSVP form handling
│
├── components/              # Modular HTML components
│   ├── navbar.html          # Navigation bar
│   ├── home.html            # Hero and countdown sections
│   ├── couple-intro.html    # Couple introduction
│   ├── couple.html          # Couple love story
│   ├── events.html          # Wedding events
│   ├── gallery.html         # Photo gallery
│   ├── rsvp.html            # RSVP form
│   └── footer.html          # Page footer
│
│
└── images/                  # Image assets
    ├── favicon/             # Favicon images
    ├── gallery/             # Photo gallery images
    │   ├── engagement/
    │   │   ├── thumbnails/
    │   │   └── full/
    ├── flags/               # Language flag icons
    └── ... (other images)
```

## Key Features

- Modular component-based architecture
- Responsive design
- Dynamic content loading
- Interactive gallery with lightbox
- RSVP form with Google Sheets integration
- Bilingual support (English/Vietnamese)

## Setup and Running

1. Clone the repository
2. Install Node.js and npm if you haven't already.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start a local development server.
5. Visit `http://localhost:8080` in your browser.

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

## Performance Optimization

For faster loading and better performance:
- Resize images to optimize display and efficiency
- Use image compression to reduce file sizes
- Recommended ImageMagick command:
  ```
  mogrify -resize "600x600>" -quality 80 *.jpg
  ```

## Credits

- Fonts: Google Fonts (Dancing Script, Montserrat)
- Icons: Font Awesome 6
- Development: 2025
- Massive credit to LamVD[ICT-Gen4], DungNT[WEO-Gen7] 
