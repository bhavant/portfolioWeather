/**
 * Tests for weatherService.
 * Covers API fetching, data transformation, and formatting helpers.
 * Uses global fetch mock instead of MSW for simplicity.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchForecast,
  transformForecastData,
  transformHourlyItem,
  getDayName,
  formatTime,
  getWeatherIconUrl,
} from '../../services/weatherService';
import {
  createMockOWMResponse,
  createMockOWMItem,
} from '../mocks/weatherData';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchForecast', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches and transforms forecast data successfully', async () => {
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchForecast('Austin, TX');

    // Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/weather?q=Austin')
    );

    // Verify response shape
    expect(result.cityName).toBe('Austin, US');
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toHaveProperty('date');
    expect(result.forecast[0]).toHaveProperty('dayName');
    expect(result.forecast[0]).toHaveProperty('hourly');
  });

  it('throws error on non-OK response with error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'City not found' }),
    });

    await expect(fetchForecast('InvalidCity')).rejects.toThrow('City not found');
  });

  it('throws generic error when response JSON parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    });

    await expect(fetchForecast('Austin')).rejects.toThrow(
      'Weather data unavailable (500)'
    );
  });
});

describe('transformForecastData', () => {
  it('groups forecast items by date into day forecasts', () => {
    const mockResponse = createMockOWMResponse();
    const result = transformForecastData(mockResponse.list);

    // Should produce 5 days
    expect(result).toHaveLength(5);

    // Each day should have hourly entries
    result.forEach((day) => {
      expect(day.hourly.length).toBeGreaterThan(0);
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.dayName).toBeTruthy();
      expect(typeof day.tempHigh).toBe('number');
      expect(typeof day.tempLow).toBe('number');
      expect(day.tempHigh).toBeGreaterThanOrEqual(day.tempLow);
    });
  });

  it('limits output to 5 days even with more data', () => {
    const mockResponse = createMockOWMResponse();
    // Add extra items for a 6th day
    const extraDate = '2024-01-20';
    for (let h = 0; h < 8; h++) {
      mockResponse.list.push(
        createMockOWMItem({
          dt_txt: `${extraDate} ${String(h * 3).padStart(2, '0')}:00:00`,
        })
      );
    }

    const result = transformForecastData(mockResponse.list);
    expect(result).toHaveLength(5);
  });

  it('uses midday entry for representative condition', () => {
    const items = [
      createMockOWMItem({
        dt_txt: '2024-01-15 09:00:00',
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      }),
      createMockOWMItem({
        dt_txt: '2024-01-15 12:00:00',
        weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
      }),
      createMockOWMItem({
        dt_txt: '2024-01-15 15:00:00',
        weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
      }),
    ];

    const result = transformForecastData(items);
    // Midday (12:00) should be used for condition
    expect(result[0].condition).toBe('Clouds');
    expect(result[0].description).toBe('scattered clouds');
  });

  it('handles empty input gracefully', () => {
    const result = transformForecastData([]);
    expect(result).toEqual([]);
  });
});

describe('transformHourlyItem', () => {
  it('transforms OWM item to HourlyWeather format', () => {
    const item = createMockOWMItem({
      dt_txt: '2024-01-15 15:00:00',
      main: {
        temp: 72.6,
        feels_like: 70.2,
        temp_min: 68,
        temp_max: 75,
        pressure: 1013,
        humidity: 55,
      },
      wind: { speed: 8.4, deg: 180 },
      pop: 0.25,
    });

    const result = transformHourlyItem(item);

    expect(result.temp).toBe(73); // Rounded
    expect(result.feelsLike).toBe(70); // Rounded
    expect(result.humidity).toBe(55);
    expect(result.windSpeed).toBe(8); // Rounded
    expect(result.condition).toBe('Clear');
    expect(result.description).toBe('clear sky');
    expect(result.icon).toBe('01d');
    expect(result.pop).toBe(25); // Converted to percentage
  });
});

describe('getDayName', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    expect(getDayName(dateStr)).toBe('Today');
  });

  it('returns full weekday name for other dates', () => {
    // Use a known date: Jan 15, 2024 is a Monday
    expect(getDayName('2024-01-15')).toBe('Monday');
  });

  it('returns correct day for various dates', () => {
    expect(getDayName('2024-01-16')).toBe('Tuesday');
    expect(getDayName('2024-01-17')).toBe('Wednesday');
  });
});

describe('formatTime', () => {
  it('formats datetime string to 12-hour time', () => {
    const result = formatTime('2024-01-15 15:00:00');
    expect(result).toMatch(/3:00\s*PM/);
  });

  it('formats midnight correctly', () => {
    const result = formatTime('2024-01-15 00:00:00');
    expect(result).toMatch(/12:00\s*AM/);
  });

  it('formats noon correctly', () => {
    const result = formatTime('2024-01-15 12:00:00');
    expect(result).toMatch(/12:00\s*PM/);
  });
});

describe('getWeatherIconUrl', () => {
  it('constructs correct OWM icon URL', () => {
    expect(getWeatherIconUrl('01d')).toBe(
      'https://openweathermap.org/img/wn/01d@2x.png'
    );
  });

  it('handles night icons', () => {
    expect(getWeatherIconUrl('10n')).toBe(
      'https://openweathermap.org/img/wn/10n@2x.png'
    );
  });
});
