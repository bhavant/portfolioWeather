/**
 * Mock Data Factory
 *
 * Provides consistent mock data for weather API responses and domain types.
 * Used across all test files for predictable, repeatable test data.
 */

import {
  OWMForecastResponse,
  OWMForecastItem,
  DayForecast,
  HourlyWeather,
} from '../../types';

/**
 * Creates a single mock OWM forecast item (3-hour entry).
 */
export function createMockOWMItem(
  overrides: Partial<OWMForecastItem> = {}
): OWMForecastItem {
  return {
    dt: 1700000000,
    main: {
      temp: 72,
      feels_like: 70,
      temp_min: 68,
      temp_max: 75,
      pressure: 1013,
      humidity: 55,
    },
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    ],
    clouds: { all: 5 },
    wind: { speed: 8, deg: 180 },
    visibility: 10000,
    pop: 0.1,
    dt_txt: '2024-01-15 12:00:00',
    ...overrides,
  };
}

/**
 * Creates a full mock OWM 5-day forecast API response.
 * Generates 8 items per day (3-hour intervals) for 5 days.
 */
export function createMockOWMResponse(): OWMForecastResponse {
  const items: OWMForecastItem[] = [];
  const baseDate = new Date('2024-01-15');
  const hours = ['00', '03', '06', '09', '12', '15', '18', '21'];

  for (let day = 0; day < 5; day++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    for (const hour of hours) {
      items.push(
        createMockOWMItem({
          dt: Math.floor(date.getTime() / 1000) + parseInt(hour) * 3600,
          dt_txt: `${dateStr} ${hour}:00:00`,
          main: {
            temp: 65 + Math.random() * 20,
            feels_like: 63 + Math.random() * 20,
            temp_min: 60 + day * 2,
            temp_max: 75 + day * 2,
            pressure: 1013,
            humidity: 45 + day * 5,
          },
          weather: [
            {
              id: 800,
              main: day % 2 === 0 ? 'Clear' : 'Clouds',
              description: day % 2 === 0 ? 'clear sky' : 'scattered clouds',
              icon: day % 2 === 0 ? '01d' : '03d',
            },
          ],
          wind: { speed: 5 + day, deg: 180 + day * 30 },
          pop: 0.1 * day,
        })
      );
    }
  }

  return {
    cod: '200',
    message: 0,
    cnt: items.length,
    list: items,
    city: {
      id: 4671654,
      name: 'Austin',
      coord: { lat: 30.2672, lon: -97.7431 },
      country: 'US',
      timezone: -21600,
      sunrise: 1700050000,
      sunset: 1700090000,
    },
  };
}

/**
 * Creates a mock HourlyWeather entry for component tests.
 */
export function createMockHourly(
  overrides: Partial<HourlyWeather> = {}
): HourlyWeather {
  return {
    time: '12:00 PM',
    temp: 72,
    feelsLike: 70,
    humidity: 55,
    windSpeed: 8,
    condition: 'Clear',
    description: 'clear sky',
    icon: '01d',
    pop: 10,
    ...overrides,
  };
}

/**
 * Creates a mock DayForecast for component tests.
 */
export function createMockDayForecast(
  overrides: Partial<DayForecast> = {}
): DayForecast {
  return {
    date: '2024-01-15',
    dayName: 'Monday',
    tempHigh: 78,
    tempLow: 62,
    condition: 'Clear',
    description: 'clear sky',
    icon: '01d',
    humidity: 55,
    windSpeed: 8,
    hourly: [
      createMockHourly({ time: '9:00 AM', temp: 65 }),
      createMockHourly({ time: '12:00 PM', temp: 72 }),
      createMockHourly({ time: '3:00 PM', temp: 78 }),
      createMockHourly({ time: '6:00 PM', temp: 70 }),
    ],
    ...overrides,
  };
}

/**
 * Creates an array of 5 mock DayForecast objects for forecast card tests.
 */
export function createMockFiveDayForecast(): DayForecast[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Snow'];
  const descriptions = [
    'clear sky',
    'scattered clouds',
    'light rain',
    'clear sky',
    'light snow',
  ];
  const icons = ['01d', '03d', '10d', '01d', '13d'];

  return days.map((dayName, i) =>
    createMockDayForecast({
      date: `2024-01-${15 + i}`,
      dayName,
      tempHigh: 75 - i * 3,
      tempLow: 60 - i * 2,
      condition: conditions[i],
      description: descriptions[i],
      icon: icons[i],
    })
  );
}
