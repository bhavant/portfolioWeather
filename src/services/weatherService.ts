/**
 * Weather Service
 *
 * Handles all API communication with the proxy server.
 * Transforms raw OWM API responses into normalized app domain types.
 */

import {
  OWMForecastResponse,
  OWMForecastItem,
  DayForecast,
  HourlyWeather,
} from '../types';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Base URL for the proxy API.
 * - In production: points to your Vercel deployment (set in .env)
 * - In development: Vite proxies /api to localhost:3001
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// =============================================================================
// API Fetching
// =============================================================================

/**
 * Fetches the 5-day/3-hour forecast from our proxy server.
 *
 * @param query - City name or zip code (formatted by validation utils)
 * @returns Array of 5 DayForecast objects with hourly breakdowns
 * @throws Error with user-friendly message on failure
 */
export async function fetchForecast(query: string): Promise<{
  forecast: DayForecast[];
  cityName: string;
}> {
  const url = `${API_BASE_URL}/api/weather?q=${encodeURIComponent(query)}`;

  const response = await fetch(url);

  // Handle HTTP errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.error || `Weather data unavailable (${response.status})`;
    throw new Error(message);
  }

  const data: OWMForecastResponse = await response.json();

  // Transform API response into our app's domain types
  const forecast = transformForecastData(data.list);
  const cityName = `${data.city.name}, ${data.city.country}`;

  return { forecast, cityName };
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Groups 3-hour forecast items by date and aggregates daily data.
 * OWM returns 40 items (8 per day * 5 days), we group them into 5 days.
 *
 * @param items - Array of OWM 3-hour forecast items
 * @returns Array of up to 5 DayForecast objects
 */
export function transformForecastData(items: OWMForecastItem[]): DayForecast[] {
  // Get today's date in local timezone (YYYY-MM-DD)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Group forecast items by LOCAL date, not UTC date.
  // OWM dt_txt is UTC; convert to local date for correct day grouping.
  const groupedByDate = new Map<string, OWMForecastItem[]>();

  for (const item of items) {
    // Convert UTC timestamp to local date string
    const localDate = new Date(item.dt * 1000);
    const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

    const existing = groupedByDate.get(dateKey) || [];
    existing.push(item);
    groupedByDate.set(dateKey, existing);
  }

  // Ensure today is always the first key even if OWM skipped it
  // (happens very late at night when next slot is past midnight UTC)
  const sortedDates = Array.from(groupedByDate.keys()).sort();
  if (sortedDates.length > 0 && sortedDates[0] > todayStr) {
    // OWM has no entries for today; insert today placeholder from first available entry
    const firstItem = items[0];
    groupedByDate.set(todayStr, [firstItem]);
    sortedDates.unshift(todayStr);
  }

  // Transform each group into a DayForecast, limit to 6 (today + 5 upcoming)
  const forecasts: DayForecast[] = [];

  for (const date of sortedDates) {
    if (forecasts.length >= 6) break;

    const dayItems = groupedByDate.get(date)!;

    // Calculate aggregated values for the day
    const temps = dayItems.map((item) => item.main.temp);
    const humidities = dayItems.map((item) => item.main.humidity);
    const winds = dayItems.map((item) => item.wind.speed);

    // Use the midday entry (or middle entry) for representative condition
    const midday =
      dayItems.find((item) => item.dt_txt.includes('12:00:00')) ||
      dayItems[Math.floor(dayItems.length / 2)];

    forecasts.push({
      date,
      dayName: getDayName(date),
      tempHigh: Math.round(Math.max(...temps)),
      tempLow: Math.round(Math.min(...temps)),
      condition: midday.weather[0].main,
      description: midday.weather[0].description,
      icon: midday.weather[0].icon,
      humidity: Math.round(
        humidities.reduce((a, b) => a + b, 0) / humidities.length
      ),
      windSpeed: Math.round(
        winds.reduce((a, b) => a + b, 0) / winds.length
      ),
      hourly: dayItems.map(transformHourlyItem),
    });
  }

  return forecasts;
}

/**
 * Transforms a single OWM forecast item into an HourlyWeather entry.
 *
 * @param item - Single OWM 3-hour forecast item
 * @returns Normalized HourlyWeather object
 */
export function transformHourlyItem(item: OWMForecastItem): HourlyWeather {
  return {
    time: formatTime(item.dt_txt),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed),
    condition: item.weather[0].main,
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    pop: Math.round(item.pop * 100),
  };
}

// =============================================================================
// Formatting Helpers
// =============================================================================

/**
 * Gets the day name from a date string.
 * Returns "Today" for today's date, otherwise the full weekday name.
 *
 * @param dateStr - Date string in "YYYY-MM-DD" format
 * @returns Day name string (e.g. "Today", "Monday", "Tuesday")
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();

  // Compare by date only (ignore time)
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Formats a datetime string into 12-hour time format.
 *
 * @param dtTxt - OWM datetime string "YYYY-MM-DD HH:MM:SS"
 * @returns Formatted time string (e.g. "3:00 PM")
 */
export function formatTime(dtTxt: string): string {
  const date = new Date(dtTxt.replace(' ', 'T'));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Constructs the full URL for an OWM weather icon.
 *
 * @param iconCode - OWM icon code (e.g. "01d", "10n")
 * @returns Full URL to the icon PNG (2x resolution)
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
