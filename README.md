# PrintPricePro Website

A modern, responsive website for PrintPricePro - a 3D printing cost calculator application. Includes a homepage and privacy policy page.

## Features

✨ **Modern Design**

- Clean, professional interface with a blue gradient theme
- Fully responsive layout (mobile, tablet, desktop)
- Smooth scrolling and animations
- Sticky navigation and sidebar

🎨 **User Experience**

- Easy-to-read typography using Inter font
- Color-coded information boxes (blue for info, green for success)
- Quick navigation sidebar with active section highlighting
- Privacy badges highlighting key features
- Smooth scroll animations

🚀 **Performance**

- Lightweight and fast loading
- No external dependencies (except Google Fonts)
- Pure HTML, CSS, and JavaScript
- SEO-friendly structure

## File Structure

```
PrintPriceProSite/
├── index.html          # Homepage with app information
├── privacy.html        # Privacy policy page
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript for interactions and animations
├── manifest.json       # PWA manifest file
├── icon-192.png        # App icon (192x192)
├── icon-512.png        # App icon (512x512)
├── favicon.png         # Favicon
├── PRIVACY_POLICY.md   # Original privacy policy markdown
├── BRANDING.md         # Brand guidelines
├── CHANGES.md          # Changelog
└── README.md           # This file
```

## Getting Started

### Local Development

1. **Open the website locally:**
   Simply open `index.html` in your web browser:
   ```bash
   open index.html
   ```

2. **Use a local server (recommended):**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using PHP
   php -S localhost:8000
   
   # Using Node.js (with http-server)
   npx http-server -p 8000
   ```
   Then visit: `http://localhost:8000`

## Deployment Options

### Option 1: GitHub Pages (Free & Easy)

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PrintPricePro privacy policy site"
   git branch -M main
   git remote add origin https://github.com/yourusername/printpricepro-site.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select "main" branch as source
5. Your site will be live at: `https://yourusername.github.io/printpricepro-site/`

### Option 2: Netlify (Free with Custom Domain)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Or drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)

### Option 3: Vercel (Free with Custom Domain)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Option 4: Firebase Hosting (Free)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize and deploy:
   ```bash
   firebase init hosting
   firebase deploy
   ```

### Option 5: Traditional Web Hosting

Upload all files (index.html, styles.css, script.js) to your web hosting provider via FTP/SFTP.

## Customization

### Update Contact Information

Edit `index.html` around line 221-235 to update:

- Email address
- Website URL

### Change Colors

Edit `styles.css` CSS variables (lines 9-19):

```css
:root {
    --primary-color: #2563eb;     /* Main blue color */
    --primary-dark: #1e40af;      /* Darker blue */
    --primary-light: #3b82f6;     /* Lighter blue */
    /* ... other colors ... */
}
```

### Update Content

Edit the HTML sections in `index.html` to update privacy policy content. Each section has an ID for
easy navigation.

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Features Included

### Navigation

- Sticky header with logo and navigation links
- Sidebar with quick jump links
- Active section highlighting
- Smooth scroll behavior

### Visual Elements

- Privacy badges in hero section
- Info and success boxes
- SVG icons throughout
- Gradient backgrounds
- Smooth animations

### Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- High contrast text
- Responsive font sizes

## License

This website template is free to use for the PrintPricePro application.

## Support

For questions or issues with the website, please refer to the contact information in the privacy
policy.

---

**Built with ❤️ for PrintPricePro**
