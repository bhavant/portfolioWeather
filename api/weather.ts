/**
 * Vercel Serverless Function - Weather Proxy
 *
 * Acts as a secure proxy between the frontend and OpenWeatherMap API.
 * Keeps the API key server-side so it's never exposed to the browser.
 *
 * Endpoint: GET /api/weather?q=<city_or_zip>
 *
 * Query Parameters:
 *   - q: City name (e.g. "Austin, TX") or zip code with country (e.g. "90210,US")
 *
 * Environment Variables:
 *   - OPENWEATHERMAP_API_KEY: Your OpenWeatherMap API key
 *
 * ---------------------------------------------------------------
 * TODO: Set your OpenWeatherMap API key in Vercel environment vars:
 *   vercel env add OPENWEATHERMAP_API_KEY
 *   Or set it in the Vercel dashboard under Project → Settings → Environment Variables
 * ---------------------------------------------------------------
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =============================================================================
// Configuration
// =============================================================================

// OpenWeatherMap API base URL for 5-day/3-hour forecast
const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// ⬇️ FILL IN YOUR API KEY HERE (or better: use Vercel env vars) ⬇️
const API_KEY = process.env.OPENWEATHERMAP_API_KEY || '19523e3455ad9e4181a1bf5ded4de8f9';

// Allowed origin patterns for CORS
const ALLOWED_ORIGIN_PATTERNS = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview
];

/**
 * Checks if the request origin is allowed for CORS.
 * Allows localhost dev servers, Vercel deployments, and GitHub Pages.
 */
function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGIN_PATTERNS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.endsWith('.github.io')) return true;
  return false;
}

// =============================================================================
// Handler
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ---- CORS Headers ----
  const origin = req.headers.origin || '';
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---- Validate Query Parameter ----
  const query = req.query.q;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing required parameter: q' });
  }

  // Prevent excessively long queries
  if (query.length > 100) {
    return res.status(400).json({ error: 'Query parameter too long' });
  }

  // ---- Check API Key ----
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    return res.status(500).json({
      error:
        'Weather API key not configured. Please set OPENWEATHERMAP_API_KEY environment variable.',
    });
  }

  // ---- Determine query type and build OWM URL ----
  // Check if the query looks like a zip code (digits,country)
  const isZip = /^\d{5},\w{2}$/.test(query);

  const params = new URLSearchParams({
    appid: API_KEY,
    units: 'imperial', // Fahrenheit
  });

  // OWM uses 'zip' param for zip codes, 'q' for city names
  if (isZip) {
    params.set('zip', query);
  } else {
    params.set('q', query);
  }

  const owmUrl = `${OWM_BASE_URL}?${params.toString()}`;

  // ---- Fetch from OpenWeatherMap ----
  try {
    const owmResponse = await fetch(owmUrl);

    // Forward error status from OWM
    if (!owmResponse.ok) {
      const errorData = await owmResponse.json().catch(() => null);
      const message =
        errorData?.message || `Weather service returned ${owmResponse.status}`;

      // Map common OWM errors to user-friendly messages
      if (owmResponse.status === 404) {
        return res.status(404).json({ error: 'City not found. Please check your search and try again.' });
      }
      if (owmResponse.status === 401) {
        return res.status(500).json({ error: 'Weather API authentication failed. Please contact the administrator.' });
      }

      return res.status(owmResponse.status).json({ error: message });
    }

    // Forward successful response
    const data = await owmResponse.json();

    // Cache for 10 minutes to reduce API calls
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');

    return res.status(200).json(data);
  } catch (error) {
    // Network or parsing errors
    console.error('Weather proxy error:', error);
    return res.status(502).json({
      error: 'Unable to connect to weather service. Please try again later.',
    });
  }
}
