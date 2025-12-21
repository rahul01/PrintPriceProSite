# Quick Deployment Guide

## 🚀 Fastest: Netlify Drop (1 minute)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire `PrintPriceProSite` folder
3. Done! Your site is live with a URL like: `https://random-name-123.netlify.app`
4. (Optional) Change the site name in Netlify settings
5. (Optional) Add a custom domain in Netlify settings

## GitHub Pages (5 minutes)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: PrintPricePro privacy policy site"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/printpricepro-site.git
git branch -M main
git push -u origin main
```

Then:

1. Go to your repository on GitHub
2. Click Settings → Pages
3. Under "Source", select "main" branch
4. Click Save
5. Your site will be live at: `https://YOUR_USERNAME.github.io/printpricepro-site/`

## Vercel (3 minutes)

```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Deploy
cd /Users/rahul/AndroidStudioProjects/PrintPriceProSite
vercel
```

Follow the prompts, and your site will be live!

## Privacy Policy URL

The privacy policy is now at `/privacy.html`. Use this path when linking from your app:

```
https://YOUR_USERNAME.github.io/printpricepro-site/privacy.html
```

## Custom Domain Setup

Once deployed on any platform:

### For Netlify:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS instructions

### For Vercel:

1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS records as shown

### For GitHub Pages:

1. Add a `CNAME` file with your domain
2. Configure DNS A records to point to GitHub's IPs
3. Enable HTTPS in repository settings

## Testing Locally

Before deployment, test locally:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: PHP
php -S localhost:8000

# Option 3: Node.js
npx http-server -p 8000
```

Visit `http://localhost:8000` to preview.

## Pre-Deployment Checklist

- [ ] Update contact email in `index.html` (line ~228)
- [ ] Update website URL in `index.html` (line ~237)
- [ ] Test on mobile and desktop
- [ ] Check all links work
- [ ] Verify privacy policy content is accurate
- [ ] Test on different browsers

## Post-Deployment

1. **Test the live site** on mobile and desktop
2. **Share the URL** in your Android app
3. **Update app store listing** with the privacy policy URL
4. **Monitor traffic** (optional: add Google Analytics)

## Need Help?

- Netlify Docs: [https://docs.netlify.com](https://docs.netlify.com)
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- GitHub Pages: [https://pages.github.com](https://pages.github.com)
