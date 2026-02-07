/**
 * Weather Context
 *
 * Centralized state management for the Weather Informer app.
 * Provides forecast data, recent searches, loading/error states,
 * and actions (fetch, select day, close modal) to all child components.
 *
 * Recent searches are persisted to localStorage for cross-session retention.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  WeatherContextValue,
  WeatherState,
  DayForecast,
  WeatherCondition,
} from '../types';
import { fetchForecast } from '../services/weatherService';
import { mapOWMCondition } from '../utils/theme';
import { validateSearchInput, formatApiQuery } from '../utils/validation';

// LocalStorage key for persisting recent searches
const STORAGE_KEY = 'weather-informer-recent-searches';

// Maximum number of recent searches to keep
const MAX_RECENT_SEARCHES = 5;

// =============================================================================
// Context Creation
// =============================================================================

/**
 * React context for weather state and actions.
 * Initialized as undefined; consumers must be wrapped in WeatherProvider.
 */
const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

// =============================================================================
// Helper: localStorage Access
// =============================================================================

/**
 * Loads recent searches from localStorage.
 * Returns empty array if storage is unavailable or data is corrupted.
 */
function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array of strings
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'string')) {
        return parsed.slice(0, MAX_RECENT_SEARCHES);
      }
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return [];
}

/**
 * Saves recent searches to localStorage.
 * Silently fails if storage is unavailable.
 */
function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

// =============================================================================
// Provider Component
// =============================================================================

interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  // Initialize state with defaults; recent searches loaded from localStorage
  const [state, setState] = useState<WeatherState>({
    forecast: null,
    cityName: '',
    recentSearches: loadRecentSearches(),
    loading: false,
    error: null,
    currentCondition: 'Default',
    selectedDay: null,
  });

  // Persist recent searches to localStorage whenever they change
  useEffect(() => {
    saveRecentSearches(state.recentSearches);
  }, [state.recentSearches]);

  /**
   * Fetches weather data for a given search query.
   * Validates input, calls the proxy API, updates state with results,
   * and adds the query to recent searches.
   */
  const fetchWeather = useCallback(async (query: string) => {
    // Validate input before making API call
    const validation = validateSearchInput(query);
    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        error: 'Please enter a valid US city name or 5-digit zip code.',
      }));
      return;
    }

    // Format the query for the API (e.g., append ",US" for zip codes)
    const apiQuery = formatApiQuery(validation.sanitized, validation.type as 'city' | 'zip');

    // Set loading state
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const { forecast, cityName } = await fetchForecast(apiQuery);

      // Determine the current weather condition from the first day's forecast
      const condition: WeatherCondition = forecast.length > 0
        ? mapOWMCondition(forecast[0].condition)
        : 'Default';

      setState((prev) => {
        // Add to recent searches (deduplicate, keep at most 5, most recent first)
        const newSearches = [
          validation.sanitized,
          ...prev.recentSearches.filter(
            (s) => s.toLowerCase() !== validation.sanitized.toLowerCase()
          ),
        ].slice(0, MAX_RECENT_SEARCHES);

        return {
          ...prev,
          forecast,
          cityName,
          recentSearches: newSearches,
          loading: false,
          error: null,
          currentCondition: condition,
        };
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  /**
   * Selects a day to show in the detail modal.
   */
  const selectDay = useCallback((day: DayForecast) => {
    setState((prev) => ({ ...prev, selectedDay: day }));
  }, []);

  /**
   * Closes the day detail modal.
   */
  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, selectedDay: null }));
  }, []);

  /**
   * Dismisses the current error message.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Assemble context value from state + actions
  const value: WeatherContextValue = {
    ...state,
    fetchWeather,
    selectDay,
    closeModal,
    clearError,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

// =============================================================================
// Custom Hook
// =============================================================================

/**
 * Hook to access weather context.
 * Must be used within a WeatherProvider.
 *
 * @throws Error if used outside of WeatherProvider
 * @returns WeatherContextValue with state and actions
 */
export function useWeather(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
