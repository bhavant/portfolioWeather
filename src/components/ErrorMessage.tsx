/**
 * ErrorMessage Component
 *
 * Displays error messages with a dismiss button.
 * Styled with a subtle red/warning appearance that adapts to the weather theme.
 */

import { ErrorMessageProps } from '../types';

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 mx-auto max-w-xl
                 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm
                 animate-fade-in"
      role="alert"
    >
      {/* Error icon + message */}
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 flex-shrink-0 text-red-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-sm">{message}</p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss error"
      >
        <svg
          className="w-4 h-4"
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
    </div>
  );
}
