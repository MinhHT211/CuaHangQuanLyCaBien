# Quốc Việt & Thanh Thủy Wedding Website

A beautiful, responsive wedding website for Quốc Việt & Thanh Thủy's special day.

## Project Structure

```
wedding-website/
├── components/           # HTML components for each section
│   ├── couple.html       # Our Story section
│   ├── events.html       # Events section
│   ├── footer.html       # Footer section
│   ├── gallery.html      # Gallery section
│   ├── header.html       # Header section
│   ├── home.html         # Home/Hero section
│   └── rsvp.html         # RSVP section
├── css/
│   └── main.css          # Main stylesheet
├── images/               # Website images
│   ├── couple.jpg        # Couple photo
│   ├── event.jpg         # Event photo
│   ├── hero-bg.jpg       # Hero background
│   ├── rsvp-bg.jpg       # RSVP background
│   └── gallery/          # Gallery images
│       ├── journey/      # Images for "Hành trình" category
│       ├── memories/     # Images for "Kỷ niệm" category
│       ├── engagement/   # Images for "Lễ ăn hỏi" category
│       └── wedding/      # Images for "Lễ thành hôn" category
├── scripts/
│   ├── main.js           # Main JavaScript file
│   ├── component-loader.js # Loads HTML components
│   └── jquery.min.js     # jQuery library
├── index.html            # Main HTML file
├── package.json          # Project configuration
└── README.md             # This file
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
- To customize styles, edit the `css/main.css` file.
- To change functionality, edit the `scripts/main.js` file.

## Deployment

To deploy this website to a production server:

1. Upload all files and folders to your web hosting service.
2. Make sure your hosting service supports serving HTML, CSS, and JavaScript files.
3. If you're using a service that doesn't support client-side includes, you may need to combine all HTML components into a single file.

## Credits

- Fonts: Google Fonts (Dancing Script, Montserrat)
- Icons: Font Awesome 6
- Development: 2025