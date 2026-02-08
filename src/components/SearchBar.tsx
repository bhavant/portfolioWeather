/**
 * SearchBar Component
 *
 * Text input with validation for US city names or 5-digit zip codes.
 * Submit button is disabled until input passes validation.
 * Supports Enter key submission.
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { SearchBarProps } from '../types';
import { validateSearchInput } from '../utils/validation';

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate input on every change
  const validation = validateSearchInput(input);
  const showError = touched && input.length > 0 && !validation.isValid;
  const canSubmit = validation.isValid && !loading;

  /**
   * Handles form submission. Prevents default, calls onSearch,
   * and resets the input field.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSearch(validation.sanitized);
    setInput('');
    setTouched(false);
  };

  /**
   * Updates input state and marks the field as touched on first change.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!touched) setTouched(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Enter US city or zip code..."
            aria-label="Search city or zip code"
            aria-invalid={showError}
            className={`w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-sm
                       border placeholder-gray-600 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-gray-800/40
                       transition-all duration-200
                       ${showError
                         ? 'border-red-500/60 focus:ring-red-500/50'
                         : 'border-gray-400/40'
                       }`}
          />
        </div>

        {/* Submit button - disabled until input is valid */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-200
                     bg-gray-900/80 text-white backdrop-blur-sm border border-gray-700/30
                     hover:bg-gray-900 active:scale-95
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            // Mini spinner during loading
            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Validation error hint */}
      {showError && (
        <p className="mt-2 text-sm text-red-700 animate-fade-in" role="alert">
          Please enter a valid US city name (e.g. &quot;Austin, TX&quot;) or
          5-digit zip code.
        </p>
      )}
    </form>
  );
}
