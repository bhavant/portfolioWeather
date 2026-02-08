/**
 * TodayCard Component
 *
 * A larger, featured card for today's weather.
 * Displays more detail than the standard WeatherCard:
 * temperature, feels-like, condition, humidity, wind, and precipitation chance.
 * Clickable to open the hourly detail modal.
 */

import { WeatherCardProps } from '../types';
import { getWeatherIconUrl } from '../services/weatherService';

export function TodayCard({ day, onClick }: WeatherCardProps) {
  // Format today's full date (e.g. "Friday, February 7")
  const formattedDate = new Date(day.date + 'T12:00:00').toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  );

  // Get the current hour's weather (closest to now) for "right now" display
  const currentHour = day.hourly.length > 0 ? day.hourly[0] : null;

  return (
    <button
      onClick={onClick}
      className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl
                 bg-white/20 backdrop-blur-sm border border-white/20
                 hover:bg-white/30 hover:shadow-xl
                 active:scale-[0.99] transition-all duration-200
                 cursor-pointer text-inherit"
      aria-label={`Today's forecast: ${day.condition}, high ${day.tempHigh}°, low ${day.tempLow}°. Click for hourly details.`}
    >
      {/* Top row: day label + date */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold">Today</h3>
        <p className="text-sm opacity-70">{formattedDate}</p>
      </div>

      {/* Main content: icon + temps side by side */}
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {/* Weather icon - larger for today */}
        <img
          src={getWeatherIconUrl(day.icon)}
          alt={day.description}
          className="w-24 h-24 sm:w-28 sm:h-28"
          loading="lazy"
        />

        {/* Temperature display */}
        <div className="text-left">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-bold">{day.tempHigh}°</span>
            <span className="text-xl opacity-60">{day.tempLow}°</span>
          </div>
          <p className="text-lg capitalize mt-1">{day.description}</p>
          {currentHour && (
            <p className="text-sm opacity-70 mt-1">
              Feels like {currentHour.feelsLike}°F
            </p>
          )}
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="flex justify-center gap-6 mt-6 text-sm opacity-80">
        <span title="Humidity">💧 {day.humidity}%</span>
        <span title="Wind speed">💨 {day.windSpeed} mph</span>
        {currentHour && currentHour.pop > 0 && (
          <span title="Precipitation chance">🌧️ {currentHour.pop}%</span>
        )}
      </div>
    </button>
  );
}
