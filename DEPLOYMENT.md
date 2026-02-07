# Weather Informer - Deployment Guide

This app has two parts to deploy:

1. **Proxy API** → Vercel (holds your OpenWeatherMap API key securely)
2. **Frontend** → GitHub Pages (static site)

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free tier works)
- An [OpenWeatherMap](https://openweathermap.org/api) API key (free tier works)

### Get Your OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to "API keys" in your profile
4. Copy your API key (it may take a few hours to activate after creation)

---

## Step 1: Deploy the Proxy API to Vercel

### Option A: Via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. From the project root, log in to Vercel
vercel login

# 3. Deploy (follow the prompts; select default options)
vercel

# 4. Set your API key as an environment variable
vercel env add OPENWEATHERMAP_API_KEY
# When prompted, paste your OpenWeatherMap API key
# Select all environments: Production, Preview, Development

# 5. Redeploy to pick up the new environment variable
vercel --prod
```

### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. In "Environment Variables", add:
   - Key: `OPENWEATHERMAP_API_KEY`
   - Value: `<your OpenWeatherMap API key>`
5. Click "Deploy"

### Verify the API

After deployment, test the proxy:

```
https://your-project-name.vercel.app/api/weather?q=Austin,TX
```

You should get JSON weather data back. Save this base URL — you'll need it next.

---

## Step 2: Update the Frontend API URL

Once your Vercel proxy is deployed, update the frontend to point to it.

### Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### Edit `.env`:

```env
VITE_API_BASE_URL=https://your-project-name.vercel.app
```

Replace `your-project-name` with your actual Vercel project URL.

### Update CORS in the Proxy

Edit `api/weather.ts` and add your GitHub Pages URL to the `ALLOWED_ORIGINS` array:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://yourusername.github.io',  // ← Add this
];
```

Redeploy to Vercel after this change:

```bash
vercel --prod
```

---

## Step 3: Build the Frontend

```bash
# Install dependencies (if not already done)
npm install

# Build the production bundle
npm run build
```

This creates a `dist/` folder with the optimized static files.

### Verify the build locally:

```bash
npm run preview
```

Open http://localhost:4173 in your browser to test.

---

## Step 4: Deploy Frontend to GitHub Pages

### Option A: Manual Deployment

```bash
# 1. Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# 2. Create a GitHub repository and push
git remote add origin https://github.com/yourusername/WeatherAppClaude.git
git branch -M main
git push -u origin main

# 3. Install gh-pages helper
npm install --save-dev gh-pages

# 4. Add deploy script to package.json (already included):
#    "deploy": "npm run build && gh-pages -d dist"

# 5. Deploy to GitHub Pages
npx gh-pages -d dist
```

### Option B: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
```

Then in your GitHub repo:
1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. Go to Settings → Secrets and Variables → Actions
4. Add secret: `VITE_API_BASE_URL` = `https://your-project-name.vercel.app`
5. Push to `main` — the action will auto-deploy

### Configure GitHub Pages Base Path

If your repo is at `https://yourusername.github.io/WeatherAppClaude/`, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/WeatherAppClaude/',  // ← match your repo name
  // ... rest of config
});
```

Rebuild and redeploy after this change.

---

## Step 5: Verify Everything Works

1. Open your GitHub Pages URL:
   `https://yourusername.github.io/WeatherAppClaude/`

2. Search for a city (e.g., "New York") or zip code (e.g., "10001")

3. Verify:
   - Weather data loads and displays 5-day forecast cards
   - Background color changes based on weather condition
   - Clicking a card opens the hourly modal
   - Recent searches appear and are clickable
   - Modal closes on X, outside click, and Escape key

---

## Local Development

For local development with the proxy:

```bash
# Terminal 1: Start the Vercel dev server (runs the API locally)
vercel dev --listen 3001

# Terminal 2: Start the Vite dev server (runs the frontend)
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:3001` automatically.

Or, if you've deployed the proxy to Vercel already, just set `VITE_API_BASE_URL` in `.env` and run:

```bash
npm run dev
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| "Weather API key not configured" | Set `OPENWEATHERMAP_API_KEY` in Vercel env vars and redeploy |
| CORS errors in browser console | Add your GitHub Pages URL to `ALLOWED_ORIGINS` in `api/weather.ts` |
| API returns 401 | Your OWM API key may not be activated yet (wait up to 2 hours after creation) |
| Blank page on GitHub Pages | Check `base` in `vite.config.ts` matches your repo name |
| "City not found" | Ensure correct spelling; try zip code instead |
| Build fails | Run `npm install` then `npm run build` — check for TypeScript errors |
