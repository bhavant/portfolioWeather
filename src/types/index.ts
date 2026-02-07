/**
 * Weather Informer - Type Definitions
 *
 * All TypeScript types and interfaces used across the application.
 * Organized by domain: API responses, app state, component props, and utilities.
 */

// =============================================================================
// OpenWeatherMap API Response Types
// =============================================================================

/** Single weather condition entry from OWM API */
export interface OWMWeatherCondition {
  id: number;
  main: string; // "Clear", "Clouds", "Rain", etc.
  description: string; // "clear sky", "few clouds", etc.
  icon: string; // Icon code like "01d", "02n"
}

/** Main weather metrics from OWM API */
export interface OWMMainData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

/** Wind data from OWM API */
export interface OWMWind {
  speed: number;
  deg: number;
  gust?: number;
}

/** Cloud coverage from OWM API */
export interface OWMClouds {
  all: number; // Cloudiness percentage
}

/** City metadata from OWM 5-day forecast response */
export interface OWMCity {
  id: number;
  name: string;
  coord: { lat: number; lon: number };
  country: string;
  timezone: number; // Shift in seconds from UTC
  sunrise: number;
  sunset: number;
}

/** Single 3-hour forecast entry from OWM API */
export interface OWMForecastItem {
  dt: number; // Unix timestamp
  main: OWMMainData;
  weather: OWMWeatherCondition[];
  clouds: OWMClouds;
  wind: OWMWind;
  visibility: number;
  pop: number; // Probability of precipitation (0-1)
  dt_txt: string; // "2024-01-01 12:00:00"
}

/** Full OWM 5-day/3-hour forecast API response */
export interface OWMForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OWMForecastItem[];
  city: OWMCity;
}

// =============================================================================
// Application Domain Types
// =============================================================================

/** Normalized hourly weather entry for display */
export interface HourlyWeather {
  time: string; // Formatted time string, e.g. "3:00 PM"
  temp: number; // Temperature in Fahrenheit
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string; // e.g. "Clear", "Rain"
  description: string; // e.g. "clear sky"
  icon: string; // OWM icon code
  pop: number; // Precipitation probability as percentage (0-100)
}

/** Single day forecast with aggregated data + hourly breakdown */
export interface DayForecast {
  date: string; // ISO date string, e.g. "2024-01-15"
  dayName: string; // e.g. "Monday"
  tempHigh: number; // Day's high temperature
  tempLow: number; // Day's low temperature
  condition: string; // Primary weather condition
  description: string; // Detailed description
  icon: string; // Representative icon code
  humidity: number; // Average humidity
  windSpeed: number; // Average wind speed
  hourly: HourlyWeather[]; // 3-hour interval entries for this day
}

/** Weather condition categories for theming */
export type WeatherCondition =
  | 'Clear'
  | 'Clouds'
  | 'Rain'
  | 'Drizzle'
  | 'Thunderstorm'
  | 'Snow'
  | 'Mist'
  | 'Fog'
  | 'Haze'
  | 'Default';

// =============================================================================
// Application State Types
// =============================================================================

/** Weather context state shape */
export interface WeatherState {
  forecast: DayForecast[] | null; // 5-day forecast data
  cityName: string; // Resolved city name from API
  recentSearches: string[]; // Last 5 search terms (persisted in localStorage)
  loading: boolean; // Whether a fetch is in progress
  error: string | null; // Error message, null if no error
  currentCondition: WeatherCondition; // Drives background theme color
  selectedDay: DayForecast | null; // Currently selected day for modal
}

/** Actions available on weather context */
export interface WeatherActions {
  fetchWeather: (query: string) => Promise<void>;
  selectDay: (day: DayForecast) => void;
  closeModal: () => void;
  clearError: () => void;
}

/** Combined context value: state + actions */
export interface WeatherContextValue extends WeatherState, WeatherActions {}

// =============================================================================
// Component Prop Types
// =============================================================================

/** Props for SearchBar component */
export interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

/** Props for RecentSearches component */
export interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
}

/** Props for ForecastCards component */
export interface ForecastCardsProps {
  forecast: DayForecast[];
  onCardClick: (day: DayForecast) => void;
}

/** Props for WeatherCard component */
export interface WeatherCardProps {
  day: DayForecast;
  onClick: () => void;
}

/** Props for WeatherModal component */
export interface WeatherModalProps {
  day: DayForecast;
  onClose: () => void;
}

/** Props for ErrorMessage component */
export interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

// =============================================================================
// Utility Types
// =============================================================================

/** Validation result for search input */
export interface ValidationResult {
  isValid: boolean;
  type: 'city' | 'zip' | 'invalid';
  sanitized: string; // Trimmed and cleaned input
}

/** Theme gradient configuration for a weather condition */
export interface ThemeGradient {
  from: string; // Tailwind "from-" color class
  via?: string; // Optional Tailwind "via-" color class
  to: string; // Tailwind "to-" color class
  textColor: string; // Text color class for readability
  cardBg: string; // Card background with opacity
}

/** Proxy API response wrapper */
export interface ProxyApiResponse {
  success: boolean;
  data?: OWMForecastResponse;
  error?: string;
}
