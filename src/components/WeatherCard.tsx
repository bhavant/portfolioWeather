/**
 * WeatherCard Component
 *
 * Displays a single day's weather summary as a card.
 * Shows day name, date, weather icon, high/low temps, condition, humidity, and wind.
 * Clickable to open a detail modal with hourly breakdown.
 */

import { WeatherCardProps } from '../types';
import { getWeatherIconUrl } from '../services/weatherService';

export function WeatherCard({ day, onClick }: WeatherCardProps) {
  // Format the date to "Jan 15" style
  const formattedDate = new Date(day.date + 'T12:00:00').toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric' }
  );

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20
                 hover:bg-white/30 hover:shadow-lg hover:-translate-y-1
                 active:scale-[0.98] transition-all duration-200
                 flex flex-col items-center gap-1 cursor-pointer text-inherit"
      aria-label={`${day.dayName} forecast: ${day.condition}, high ${day.tempHigh}°, low ${day.tempLow}°. Click for hourly details.`}
    >
      {/* Day name (e.g. "Today", "Monday") */}
      <h3 className="font-semibold text-lg">{day.dayName}</h3>

      {/* Date (e.g. "Jan 15") */}
      <p className="text-xs opacity-70">{formattedDate}</p>

      {/* Weather icon from OWM */}
      <img
        src={getWeatherIconUrl(day.icon)}
        alt={day.description}
        className="w-16 h-16 -my-1"
        loading="lazy"
      />

      {/* High / Low temperatures */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{day.tempHigh}°</span>
        <span className="text-sm opacity-60">{day.tempLow}°</span>
      </div>

      {/* Weather condition description */}
      <p className="text-sm capitalize">{day.description}</p>

      {/* Humidity and wind stats */}
      <div className="flex gap-3 mt-2 text-xs opacity-70">
        <span>💧 {day.humidity}%</span>
        <span>💨 {day.windSpeed} mph</span>
      </div>
    </button>
  );
}
