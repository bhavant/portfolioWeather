/**
 * App Component
 *
 * Root component for Weather Informer.
 * Wraps everything in WeatherProvider and applies dynamic background
 * gradient based on the current weather condition.
 *
 * Layout:
 *   1. Title: "Welcome to Weather Informer" (large)
 *   2. SearchBar for city/zip input
 *   3. RecentSearches horizontal pill list
 *   4. TodayCard - large featured card for today's weather
 *   5. ForecastCards grid - next days forecast
 *   6. WeatherModal overlay (when a card is clicked)
 *   7. ErrorMessage banner (on API/validation errors)
 */

import { WeatherProvider, useWeather } from './context/WeatherContext';
import { SearchBar } from './components/SearchBar';
import { RecentSearches } from './components/RecentSearches';
import { TodayCard } from './components/TodayCard';
import { ForecastCards } from './components/ForecastCards';
import { WeatherModal } from './components/WeatherModal';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { getThemeForCondition, buildGradientClass } from './utils/theme';

/**
 * Inner app content that consumes WeatherContext.
 * Separated from App so it can use the useWeather hook.
 */
function WeatherDashboard() {
  const {
    forecast,
    cityName,
    recentSearches,
    loading,
    error,
    currentCondition,
    selectedDay,
    fetchWeather,
    selectDay,
    closeModal,
    clearError,
  } = useWeather();

  // Get theme configuration for current weather condition
  const theme = getThemeForCondition(currentCondition);
  const gradientClass = buildGradientClass(theme);

  // Split forecast into today (first entry) and remaining days
  const todayForecast = forecast && forecast.length > 0 ? forecast[0] : null;
  const upcomingForecast = forecast && forecast.length > 1 ? forecast.slice(1) : [];

  return (
    <div
      className={`min-h-screen ${gradientClass} ${theme.textColor}
                  transition-all duration-700 ease-in-out`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header section - larger title with dark text */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 tracking-tight">
            Welcome to Weather Informer
          </h1>
          <p className="text-base opacity-70">
            Search any US city or zip code for a 5-day forecast
          </p>
        </header>

        {/* Search input */}
        <SearchBar onSearch={fetchWeather} loading={loading} />

        {/* Recent searches */}
        <RecentSearches searches={recentSearches} onSelect={fetchWeather} />

        {/* Error display */}
        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} onDismiss={clearError} />
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingSpinner />}

        {/* Weather display: Today (large) + upcoming days (smaller) */}
        {!loading && forecast && forecast.length > 0 && (
          <div className="mt-8 flex flex-col">
            {/* City name display */}
            {cityName && (
              <h2 className="text-center text-xl font-semibold mb-6 opacity-90">
                {cityName}
              </h2>
            )}

            {/* Row 1: Today's weather - large featured card */}
            {todayForecast && (
              <TodayCard
                day={todayForecast}
                onClick={() => selectDay(todayForecast)}
              />
            )}

            {/* Row 2: Upcoming days - smaller cards */}
            {upcomingForecast.length > 0 && (
              <div className="mt-6">
                <ForecastCards
                  forecast={upcomingForecast}
                  onCardClick={selectDay}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state - no searches yet */}
        {!loading && !forecast && !error && (
          <div className="text-center mt-16 opacity-60">
            <p className="text-5xl mb-4">⛅</p>
            <p className="text-lg">
              Enter a city or zip code above to get started
            </p>
          </div>
        )}

        {/* Hourly detail modal */}
        {selectedDay && (
          <WeatherModal day={selectedDay} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}

/**
 * App root - wraps dashboard in the weather context provider.
 */
function App() {
  return (
    <WeatherProvider>
      <WeatherDashboard />
    </WeatherProvider>
  );
}

export default App;
