# PrintPricePro Website Branding

## Brand Colors

The website uses the official PrintPricePro app colors:

### Primary Colors

- **Purple**: `#4F41C5` - Main brand color (from app icon background)
- **Gold**: `#F6B731` - Accent color (from dollar sign in app icon)

### Color Usage

- **Purple (`#4F41C5`)**:
    - Navigation links
    - Hero section gradient
    - Section heading underlines
    - Primary buttons and interactive elements

- **Gold (`#F6B731`)**:
    - Accent highlights
    - Checkmarks in summary section
    - Hover effects on badges
    - Gradient accents

## App Icon Integration

### Icon Files

- `ic_launcher_round.webp` - Original app icon from Android project
- `favicon.png` - PNG conversion for broader browser support
- `icon-192.png` - 192x192 icon for PWA and mobile
- `icon-512.png` - 512x512 icon for high-res displays

### Usage

The app icon appears in:

- Browser favicon
- Navigation bar logo
- Footer logo
- PWA manifest icons
- Mobile home screen icon

## Typography

- **Font Family**: Inter (Google Fonts)
- **Weights Used**: 300, 400, 500, 600, 700

## Design Elements

### Gradients

1. **Hero Section**: Purple gradient (`#4F41C5` → `#3d2f9e`)
2. **Section Underlines**: Purple to gold gradient
3. **Summary Section**: Light purple gradient background

### Interactive Elements

- Badge hover effects with gold accent
- Smooth transitions (0.2s - 0.3s)
- Subtle shadows for depth

## Updating the Icon

If you need to update the app icon:

```bash
# 1. Replace the WebP file
cp /path/to/new/ic_launcher_round.webp .

# 2. Regenerate all icon formats
sips -s format png ic_launcher_round.webp --out favicon.png
sips -z 192 192 favicon.png --out icon-192.png
sips -z 512 512 favicon.png --out icon-512.png
```

## Theme Color

The website sets the browser theme color to match the app:

```html
<meta name="theme-color" content="#4F41C5">
```

This affects:

- Android Chrome address bar color
- iOS Safari status bar
- PWA theme color

## PWA Manifest

The `manifest.json` file defines the app appearance when installed:

- **Background Color**: `#4F41C5` (purple)
- **Theme Color**: `#4F41C5` (purple)
- **Icons**: 192x192 and 512x512 PNG versions

## Brand Consistency

The website design intentionally mirrors the app's visual identity:

- Same color palette
- Same icon/logo
- Professional, clean design
- Privacy-focused messaging

This creates a cohesive brand experience across the app and web presence.
