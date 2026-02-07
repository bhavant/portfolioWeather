/**
 * Tests for validation utilities.
 * Covers all input patterns: valid cities, valid zips, invalid inputs, edge cases.
 */

import { describe, it, expect } from 'vitest';
import { validateSearchInput, formatApiQuery } from '../../utils/validation';

describe('validateSearchInput', () => {
  // --- Valid zip codes ---
  describe('valid zip codes', () => {
    it('accepts a 5-digit zip code', () => {
      const result = validateSearchInput('90210');
      expect(result).toEqual({
        isValid: true,
        type: 'zip',
        sanitized: '90210',
      });
    });

    it('accepts zip code with leading zeros', () => {
      const result = validateSearchInput('01234');
      expect(result).toEqual({
        isValid: true,
        type: 'zip',
        sanitized: '01234',
      });
    });

    it('trims whitespace from zip codes', () => {
      const result = validateSearchInput('  90210  ');
      expect(result).toEqual({
        isValid: true,
        type: 'zip',
        sanitized: '90210',
      });
    });
  });

  // --- Valid city names ---
  describe('valid city names', () => {
    it('accepts a simple city name', () => {
      const result = validateSearchInput('Austin');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'Austin',
      });
    });

    it('accepts city with state abbreviation', () => {
      const result = validateSearchInput('Austin, TX');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'Austin, TX',
      });
    });

    it('accepts city with state and no space after comma', () => {
      const result = validateSearchInput('Austin,TX');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'Austin,TX',
      });
    });

    it('accepts multi-word city names', () => {
      const result = validateSearchInput('New York');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'New York',
      });
    });

    it('accepts city names with hyphens', () => {
      const result = validateSearchInput('Winston-Salem');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'Winston-Salem',
      });
    });

    it('accepts city names with periods', () => {
      const result = validateSearchInput('St. Louis');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'St. Louis',
      });
    });

    it('accepts city names with apostrophes', () => {
      const result = validateSearchInput("O'Fallon");
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: "O'Fallon",
      });
    });

    it('trims whitespace from city names', () => {
      const result = validateSearchInput('  New York  ');
      expect(result).toEqual({
        isValid: true,
        type: 'city',
        sanitized: 'New York',
      });
    });
  });

  // --- Invalid inputs ---
  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const result = validateSearchInput('');
      expect(result).toEqual({
        isValid: false,
        type: 'invalid',
        sanitized: '',
      });
    });

    it('rejects whitespace-only string', () => {
      const result = validateSearchInput('   ');
      expect(result).toEqual({
        isValid: false,
        type: 'invalid',
        sanitized: '',
      });
    });

    it('rejects zip code with fewer than 5 digits', () => {
      const result = validateSearchInput('9021');
      // 4 digits could be a weird city name attempt but the regex won't match
      // it starts with a digit so city regex also won't match
      expect(result.isValid).toBe(false);
    });

    it('rejects zip code with more than 5 digits', () => {
      const result = validateSearchInput('902100');
      expect(result.isValid).toBe(false);
    });

    it('rejects input with special characters', () => {
      const result = validateSearchInput('Austin@TX');
      expect(result.isValid).toBe(false);
    });

    it('rejects input with numbers mixed in city name', () => {
      const result = validateSearchInput('Austin123');
      expect(result.isValid).toBe(false);
    });

    it('rejects city name starting with a number', () => {
      const result = validateSearchInput('3Austin');
      expect(result.isValid).toBe(false);
    });
  });
});

describe('formatApiQuery', () => {
  it('appends ",US" to zip codes', () => {
    expect(formatApiQuery('90210', 'zip')).toBe('90210,US');
  });

  it('formats city with state to OWM format (city,state,US)', () => {
    expect(formatApiQuery('Austin, TX', 'city')).toBe('Austin,TX,US');
  });

  it('formats city with state without space to OWM format', () => {
    expect(formatApiQuery('Austin,TX', 'city')).toBe('Austin,TX,US');
  });

  it('appends ",US" to simple city name', () => {
    expect(formatApiQuery('Denver', 'city')).toBe('Denver,US');
  });
});
