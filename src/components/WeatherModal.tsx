/**
 * WeatherModal Component
 *
 * Full-screen overlay modal that displays hourly weather breakdown for a selected day.
 * - Close via "X" button (top-left corner)
 * - Close via clicking outside the modal (on the backdrop)
 * - Close via Escape key
 *
 * Uses focus trap behavior and scroll lock for accessibility.
 */

import { useEffect, useRef, MouseEvent } from 'react';
import { WeatherModalProps } from '../types';
import { getWeatherIconUrl } from '../services/weatherService';

export function WeatherModal({ day, onClose }: WeatherModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Format the full date for the modal header
  const formattedDate = new Date(day.date + 'T12:00:00').toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  );

  /**
   * Close modal on Escape key press.
   * Also locks body scroll while modal is open.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Focus the modal for accessibility
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  /**
   * Close when clicking the backdrop (outside the modal content).
   * Checks that the click target is the backdrop itself, not a child.
   */
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Hourly forecast for ${formattedDate}`}
    >
      {/* Modal content panel */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-[95%] max-w-2xl max-h-[85vh] mx-4
                   bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
                   shadow-2xl overflow-hidden animate-slide-up outline-none"
      >
        {/* Header: close button + day info */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4">
          {/* Close button - top left corner */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full
                       hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Day header info */}
          <div className="text-center ml-8">
            <h2 className="text-xl font-bold">{day.dayName}</h2>
            <p className="text-sm opacity-70">{formattedDate}</p>
            <div className="flex items-center justify-center gap-4 mt-1">
              <span className="text-lg font-semibold">
                {day.tempHigh}° / {day.tempLow}°
              </span>
              <span className="text-sm capitalize opacity-80">
                {day.description}
              </span>
            </div>
          </div>
        </div>

        {/* Hourly forecast list - scrollable */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-4">
          <div className="space-y-2">
            {day.hourly.map((hour, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-lg
                           bg-white/10 hover:bg-white/15 transition-colors"
              >
                {/* Time */}
                <span className="w-20 text-sm font-medium flex-shrink-0">
                  {hour.time}
                </span>

                {/* Weather icon */}
                <img
                  src={getWeatherIconUrl(hour.icon)}
                  alt={hour.description}
                  className="w-10 h-10 flex-shrink-0"
                  loading="lazy"
                />

                {/* Temperature and feels-like */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{hour.temp}°F</span>
                    <span className="text-xs opacity-60">
                      Feels {hour.feelsLike}°
                    </span>
                  </div>
                  <p className="text-xs capitalize opacity-70 truncate">
                    {hour.description}
                  </p>
                </div>

                {/* Stats: humidity, wind, precipitation */}
                <div className="hidden sm:flex gap-3 text-xs opacity-70 flex-shrink-0">
                  <span title="Humidity">💧 {hour.humidity}%</span>
                  <span title="Wind speed">💨 {hour.windSpeed} mph</span>
                  <span title="Precipitation chance">🌧️ {hour.pop}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
