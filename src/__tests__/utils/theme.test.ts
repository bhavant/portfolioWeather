/**
 * Tests for theme utility functions.
 * Covers all weather conditions, gradient building, and OWM condition mapping.
 */

import { describe, it, expect } from 'vitest';
import {
  getThemeForCondition,
  buildGradientClass,
  mapOWMCondition,
} from '../../utils/theme';
import { WeatherCondition, ThemeGradient } from '../../types';

describe('getThemeForCondition', () => {
  // Test all defined weather conditions
  const conditions: WeatherCondition[] = [
    'Clear',
    'Clouds',
    'Rain',
    'Drizzle',
    'Thunderstorm',
    'Snow',
    'Mist',
    'Fog',
    'Haze',
    'Default',
  ];

  conditions.forEach((condition) => {
    it(`returns a valid theme for "${condition}"`, () => {
      const theme = getThemeForCondition(condition);
      expect(theme).toBeDefined();
      expect(theme.from).toBeTruthy();
      expect(theme.to).toBeTruthy();
      expect(theme.textColor).toBeTruthy();
      expect(theme.cardBg).toBeTruthy();
    });
  });

  it('returns Clear theme with warm orange colors', () => {
    const theme = getThemeForCondition('Clear');
    expect(theme.from).toContain('orange');
  });

  it('returns Rain theme with slate/blue colors', () => {
    const theme = getThemeForCondition('Rain');
    expect(theme.from).toContain('slate');
  });

  it('returns Snow theme with blue/white colors', () => {
    const theme = getThemeForCondition('Snow');
    expect(theme.from).toContain('blue');
  });

  it('returns Default theme with sky/blue colors', () => {
    const theme = getThemeForCondition('Default');
    expect(theme.from).toContain('sky');
  });
});

describe('buildGradientClass', () => {
  it('builds gradient string with via color', () => {
    const theme: ThemeGradient = {
      from: 'from-orange-400',
      via: 'via-amber-300',
      to: 'to-yellow-200',
      textColor: 'text-amber-900',
      cardBg: 'bg-white/30',
    };
    const result = buildGradientClass(theme);
    expect(result).toBe(
      'bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200'
    );
  });

  it('builds gradient string without via color', () => {
    const theme: ThemeGradient = {
      from: 'from-gray-400',
      to: 'to-gray-200',
      textColor: 'text-gray-800',
      cardBg: 'bg-white/40',
    };
    const result = buildGradientClass(theme);
    expect(result).toBe('bg-gradient-to-br from-gray-400 to-gray-200');
  });
});

describe('mapOWMCondition', () => {
  // Direct mappings
  it('maps "Clear" to Clear', () => {
    expect(mapOWMCondition('Clear')).toBe('Clear');
  });

  it('maps "Clouds" to Clouds', () => {
    expect(mapOWMCondition('Clouds')).toBe('Clouds');
  });

  it('maps "Rain" to Rain', () => {
    expect(mapOWMCondition('Rain')).toBe('Rain');
  });

  it('maps "Drizzle" to Drizzle', () => {
    expect(mapOWMCondition('Drizzle')).toBe('Drizzle');
  });

  it('maps "Thunderstorm" to Thunderstorm', () => {
    expect(mapOWMCondition('Thunderstorm')).toBe('Thunderstorm');
  });

  it('maps "Snow" to Snow', () => {
    expect(mapOWMCondition('Snow')).toBe('Snow');
  });

  it('maps "Mist" to Mist', () => {
    expect(mapOWMCondition('Mist')).toBe('Mist');
  });

  it('maps "Fog" to Fog', () => {
    expect(mapOWMCondition('Fog')).toBe('Fog');
  });

  it('maps "Haze" to Haze', () => {
    expect(mapOWMCondition('Haze')).toBe('Haze');
  });

  // Approximate mappings
  it('maps "Smoke" to Fog', () => {
    expect(mapOWMCondition('Smoke')).toBe('Fog');
  });

  it('maps "Dust" to Haze', () => {
    expect(mapOWMCondition('Dust')).toBe('Haze');
  });

  it('maps "Sand" to Haze', () => {
    expect(mapOWMCondition('Sand')).toBe('Haze');
  });

  it('maps "Ash" to Fog', () => {
    expect(mapOWMCondition('Ash')).toBe('Fog');
  });

  it('maps "Squall" to Thunderstorm', () => {
    expect(mapOWMCondition('Squall')).toBe('Thunderstorm');
  });

  it('maps "Tornado" to Thunderstorm', () => {
    expect(mapOWMCondition('Tornado')).toBe('Thunderstorm');
  });

  // Unknown conditions
  it('maps unknown condition to Default', () => {
    expect(mapOWMCondition('UnknownWeather')).toBe('Default');
  });

  it('maps empty string to Default', () => {
    expect(mapOWMCondition('')).toBe('Default');
  });
});
