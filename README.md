# A Heart Made of Stars 💙
### A Personalized Romantic Particle Heart Website

A mesmerizing digital experience that brings starry cosmic romance to life. Enter your name and your crush's name, generate a luminous glowing blue particle heart, and share a secret personalized link made especially for one person.

---

## ✨ Features

- **Pure Visual Elegance**: Pure black background (`#000000`) with no code editors, no developer consoles, and no distracting clutter.
- **Parametric 3D Particle Heart**: Thousands of glowing electric blue, neon cyan, ice blue, and diamond white particles computed mathematically with real physics.
- **Cinematic Swirling Entrance**: Watch stardust gather from across deep space and assemble into a living, breathing heart over ~2 seconds.
- **Living Double-Pulse Heartbeat**: Realistic systolic and diastolic cardiac rhythm and gentle 3D perspective parallax tilt.
- **Interactive Stardust Bursts**: Tap or click the heart to trigger a cosmic supernova shockwave, glowing comet trails, and floating mini particle hearts that reform smoothly.
- **Dynamic Name Personalization**:
  - Displays `"Anad ♥ [Their Name]"` in romantic typography with glowing cyan light.
  - Subtitle: *"Somewhere in this universe, my heart chose you."*
- **Secret Romantic Message Modal**:
  - Click `"Open My Message "` to reveal an intimate romantic letter in a translucent frosted dark glass panel.
  - Includes a poetic default message and supports full customization before sharing.
- **Shareable Instant URLs**:
  - Direct URL parameter support: `https://your-domain.com/?from=Anad&to=Elena`
  - When the recipient opens the link, the setup form is bypassed and the personalized heart directly bursts to life!
  - 1-click `"Copy Special Link "` with instant clipboard confirmation.
- **Optional Celestial Ambient Sound**:
  - Silent by default (strictly zero autoplay).
  - Floating sound toggle powers an ethereal Web Audio synthesizer with warm cosmic pad drones and starry pentatonic wind chimes.
- **Mobile-First & High-DPI**:
  - Silky-smooth 60–120 FPS on iOS and Android smartphones, tablets, and desktop displays.
  - Adaptive particle density and viewport scaling.

---

## 🚀 Quick Start (Local Development)

To run this project on your local machine:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔗 How Personalization Links Work

You can create a personalized heart directly by visiting with query parameters:

```
http://localhost:5173/?from=Anad&to=Sophia
```

With an optional custom message:
```
http://localhost:5173/?from=Anad&to=Sophia&msg=You%20are%20my%20universe
```

The recipient will immediately see:
1. The cinematic gathering of particles into the glowing heart.
2. **Anad ♥ Sophia**
3. *"Somewhere in this universe, my heart chose you."*
4. The button to open your personalized letter.

---

## 🌐 Deploying to Get a Real Public Link (100% Free)

> **Important**: `localhost` links only work on your own computer. To send this to your crush on WhatsApp, iMessage, Instagram, or TikTok, deploy it online to get a public URL.

### Option 1: Vercel (Fastest — 1 minute)
1. In your project terminal, run:
   ```bash
   npx vercel
   ```
2. Follow the 3 prompt questions (press Enter for defaults).
3. Vercel will give you a live HTTPS public link (e.g. `https://heart-made-of-stars.vercel.app`).
4. Open the link, create your heart, and copy the special link!

### Option 2: Netlify Drop (No command line needed)
1. Build the production files:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the `dist` folder into the Netlify window.
4. Your website is instantly live with a free shareable URL!

### Option 3: GitHub Pages
1. Push this repository to GitHub.
2. In your repository settings, enable **GitHub Pages** with the build action for Vite.

---

## 🛠️ Built With

- **React 19**
- **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **HTML5 Canvas 2D Context** (with Additive Blending & Radial Glow Sprite Caching)
- **Web Audio API**
- **Lucide Icons**
