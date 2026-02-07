/**
 * ForecastCards Component
 *
 * Container that renders a responsive grid of 5 WeatherCard components.
 * - Mobile: single column, stacked vertically
 * - Tablet: 2-3 columns
 * - Desktop: 5 columns in a single row
 *
 * Each card is clickable to open the hourly detail modal.
 */

import { ForecastCardsProps } from '../types';
import { WeatherCard } from './WeatherCard';

export function ForecastCards({ forecast, onCardClick }: ForecastCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Responsive grid: 1 col mobile → 3 cols tablet → 5 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.map((day) => (
          <WeatherCard
            key={day.date}
            day={day}
            onClick={() => onCardClick(day)}
          />
        ))}
      </div>
    </div>
  );
}
