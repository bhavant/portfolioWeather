/**
 * Input Validation Utilities
 *
 * Validates and sanitizes user input for US city names and zip codes.
 * Used by SearchBar to determine if input is submittable.
 */

import { ValidationResult } from '../types';

// US zip code: exactly 5 digits
const ZIP_REGEX = /^\d{5}$/;

// US city name: letters, spaces, periods, hyphens, apostrophes
// Optional comma + 2-letter state abbreviation (e.g. "Austin, TX")
const CITY_REGEX = /^[a-zA-Z][a-zA-Z\s.\-']{0,98}(,\s?[a-zA-Z]{2})?$/;

/**
 * Validates user search input and categorizes it as city, zip, or invalid.
 *
 * @param input - Raw user input string
 * @returns ValidationResult with validity, type, and sanitized value
 *
 * @example
 * validateSearchInput("90210")       // { isValid: true, type: "zip", sanitized: "90210" }
 * validateSearchInput("Austin, TX")  // { isValid: true, type: "city", sanitized: "Austin, TX" }
 * validateSearchInput("")            // { isValid: false, type: "invalid", sanitized: "" }
 */
export function validateSearchInput(input: string): ValidationResult {
  // Trim whitespace from both ends
  const sanitized = input.trim();

  // Empty input is invalid
  if (sanitized.length === 0) {
    return { isValid: false, type: 'invalid', sanitized };
  }

  // Check if it's a valid US zip code (5 digits)
  if (ZIP_REGEX.test(sanitized)) {
    return { isValid: true, type: 'zip', sanitized };
  }

  // Check if it's a valid US city name (with optional state abbreviation)
  if (CITY_REGEX.test(sanitized)) {
    return { isValid: true, type: 'city', sanitized };
  }

  // Input doesn't match any valid pattern
  return { isValid: false, type: 'invalid', sanitized };
}

/**
 * Formats the query parameter for the OpenWeatherMap API.
 * Zip codes get ",US" appended for US-only results.
 * City names are passed as-is (OWM handles them).
 *
 * @param sanitized - The sanitized input string
 * @param type - The validated input type ('city' or 'zip')
 * @returns Formatted query string for the API
 */
export function formatApiQuery(
  sanitized: string,
  type: 'city' | 'zip'
): string {
  if (type === 'zip') {
    // Append country code for US zip code queries
    return `${sanitized},US`;
  }

  // For city names with state abbreviation (e.g. "Austin, TX" or "Austin,TX"),
  // normalize to "Austin,TX,US" format that OWM expects
  const cityStateMatch = sanitized.match(/^(.+),\s*([a-zA-Z]{2})$/);
  if (cityStateMatch) {
    return `${cityStateMatch[1].trim()},${cityStateMatch[2]},US`;
  }

  // Simple city name - append ,US for US-only results
  return `${sanitized},US`;
}
