/**
 * LoadingSpinner Component
 *
 * Animated spinner shown while weather data is being fetched.
 * Uses Tailwind CSS animations for a smooth pulsing effect.
 */

export function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="status"
      aria-label="Loading weather data"
    >
      {/* Spinning circle */}
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      {/* Loading text */}
      <p className="mt-4 text-lg opacity-80">Fetching weather data...</p>
    </div>
  );
}
