/**
 * Weather Theme Utilities
 *
 * Maps weather conditions to visual theme configurations (gradients, text colors).
 * Used by App.tsx to dynamically change the background based on current weather.
 */

import { WeatherCondition, ThemeGradient } from '../types';

/**
 * Theme gradient map: each weather condition maps to Tailwind CSS gradient classes.
 * - `from`/`to`: gradient start/end colors
 * - `textColor`: ensures readability against the background
 * - `cardBg`: semi-transparent card background for contrast
 */
const THEME_MAP: Record<WeatherCondition, ThemeGradient> = {
  Clear: {
    from: 'from-orange-400',
    via: 'via-amber-300',
    to: 'to-yellow-200',
    textColor: 'text-amber-900',
    cardBg: 'bg-white/30',
  },
  Clouds: {
    from: 'from-gray-400',
    via: 'via-slate-300',
    to: 'to-gray-200',
    textColor: 'text-gray-800',
    cardBg: 'bg-white/40',
  },
  Rain: {
    from: 'from-slate-600',
    via: 'via-blue-gray-500',
    to: 'to-gray-400',
    textColor: 'text-white',
    cardBg: 'bg-white/20',
  },
  Drizzle: {
    from: 'from-slate-500',
    via: 'via-gray-400',
    to: 'to-blue-300',
    textColor: 'text-white',
    cardBg: 'bg-white/25',
  },
  Thunderstorm: {
    from: 'from-purple-900',
    via: 'via-gray-800',
    to: 'to-slate-900',
    textColor: 'text-white',
    cardBg: 'bg-white/15',
  },
  Snow: {
    from: 'from-blue-100',
    via: 'via-white',
    to: 'to-blue-200',
    textColor: 'text-blue-900',
    cardBg: 'bg-white/50',
  },
  Mist: {
    from: 'from-gray-300',
    via: 'via-gray-200',
    to: 'to-slate-200',
    textColor: 'text-gray-700',
    cardBg: 'bg-white/40',
  },
  Fog: {
    from: 'from-gray-400',
    via: 'via-gray-300',
    to: 'to-gray-200',
    textColor: 'text-gray-800',
    cardBg: 'bg-white/40',
  },
  Haze: {
    from: 'from-yellow-200',
    via: 'via-gray-300',
    to: 'to-amber-100',
    textColor: 'text-gray-800',
    cardBg: 'bg-white/35',
  },
  Default: {
    from: 'from-sky-400',
    via: 'via-blue-400',
    to: 'to-indigo-500',
    textColor: 'text-white',
    cardBg: 'bg-white/25',
  },
};

/**
 * Gets the theme gradient configuration for a given weather condition.
 * Falls back to 'Default' theme if the condition is not mapped.
 *
 * @param condition - The current weather condition string
 * @returns ThemeGradient object with Tailwind classes
 */
export function getThemeForCondition(condition: WeatherCondition): ThemeGradient {
  return THEME_MAP[condition] || THEME_MAP.Default;
}

/**
 * Builds the full Tailwind gradient class string for the background.
 *
 * @param theme - ThemeGradient configuration object
 * @returns Complete gradient class string, e.g. "bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200"
 */
export function buildGradientClass(theme: ThemeGradient): string {
  const parts = ['bg-gradient-to-br', theme.from];
  if (theme.via) {
    parts.push(theme.via);
  }
  parts.push(theme.to);
  return parts.join(' ');
}

/**
 * Maps an OWM weather condition string to our WeatherCondition type.
 * Handles edge cases like "Smoke", "Dust", etc. by mapping to nearest match.
 *
 * @param owmCondition - The "main" field from OWM weather data
 * @returns Normalized WeatherCondition for theming
 */
export function mapOWMCondition(owmCondition: string): WeatherCondition {
  // Direct matches
  const directMap: Record<string, WeatherCondition> = {
    Clear: 'Clear',
    Clouds: 'Clouds',
    Rain: 'Rain',
    Drizzle: 'Drizzle',
    Thunderstorm: 'Thunderstorm',
    Snow: 'Snow',
    Mist: 'Mist',
    Fog: 'Fog',
    Haze: 'Haze',
    // Approximate mappings for less common conditions
    Smoke: 'Fog',
    Dust: 'Haze',
    Sand: 'Haze',
    Ash: 'Fog',
    Squall: 'Thunderstorm',
    Tornado: 'Thunderstorm',
  };

  return directMap[owmCondition] || 'Default';
}
