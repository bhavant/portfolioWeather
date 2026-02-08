/**
 * Tests for WeatherContext.
 * Tests the provider, state management, actions, and localStorage persistence.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherProvider, useWeather } from '../../context/WeatherContext';
import { createMockOWMResponse } from '../mocks/weatherData';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * Test helper component that exposes context values to the DOM for assertions.
 */
function TestConsumer() {
  const {
    forecast,
    cityName,
    recentSearches,
    loading,
    error,
    currentCondition,
    selectedDay,
    fetchWeather,
    selectDay,
    closeModal,
    clearError,
  } = useWeather();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error || 'none'}</div>
      <div data-testid="condition">{currentCondition}</div>
      <div data-testid="city">{cityName}</div>
      <div data-testid="forecast-count">
        {forecast ? forecast.length : 0}
      </div>
      <div data-testid="recent-searches">
        {recentSearches.join(',')}
      </div>
      <div data-testid="selected-day">
        {selectedDay ? selectedDay.dayName : 'none'}
      </div>

      <button onClick={() => fetchWeather('Austin, TX')}>Fetch Austin</button>
      <button onClick={() => fetchWeather('90210')}>Fetch Zip</button>
      <button onClick={() => fetchWeather('')}>Fetch Empty</button>
      <button onClick={() => fetchWeather('!!invalid!!')}>Fetch Invalid</button>
      {forecast && forecast.length > 0 && (
        <button onClick={() => selectDay(forecast[0])}>Select Day</button>
      )}
      <button onClick={closeModal}>Close Modal</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

describe('WeatherContext', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it('provides default state values', () => {
    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
    expect(screen.getByTestId('condition')).toHaveTextContent('Default');
    expect(screen.getByTestId('forecast-count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected-day')).toHaveTextContent('none');
  });

  it('throws error when useWeather is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useWeather must be used within a WeatherProvider'
    );

    consoleSpy.mockRestore();
  });

  it('fetches weather and updates forecast state', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(Number(screen.getByTestId('forecast-count').textContent)).toBeGreaterThanOrEqual(5);
    expect(screen.getByTestId('city')).toHaveTextContent('Austin, US');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('adds search term to recent searches on successful fetch', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('recent-searches')).toHaveTextContent(
        'Austin, TX'
      );
    });
  });

  it('deduplicates recent searches (case-insensitive)', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();

    // First fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));
    await waitFor(() => {
      expect(screen.getByTestId('recent-searches')).toHaveTextContent('Austin, TX');
    });

    // Second fetch with same term
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await user.click(screen.getByText('Fetch Austin'));
    await waitFor(() => {
      // Should still only have one entry
      expect(screen.getByTestId('recent-searches').textContent).toBe('Austin, TX');
    });
  });

  it('sets error for empty/invalid search input', async () => {
    const user = userEvent.setup();

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Empty'));

    expect(screen.getByTestId('error')).toHaveTextContent(
      'Please enter a valid US city name or 5-digit zip code.'
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets error for invalid input format', async () => {
    const user = userEvent.setup();

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Invalid'));

    expect(screen.getByTestId('error')).toHaveTextContent(
      'Please enter a valid US city name or 5-digit zip code.'
    );
  });

  it('handles API fetch errors', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'City not found' }),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('City not found');
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('handles network errors', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network failure');
    });
  });

  it('handles non-Error thrown values', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce('some string error');

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'An unexpected error occurred.'
      );
    });
  });

  it('selects a day and opens modal', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    // First fetch data
    await user.click(screen.getByText('Fetch Austin'));
    await waitFor(() => {
      expect(Number(screen.getByTestId('forecast-count').textContent)).toBeGreaterThanOrEqual(5);
    });

    // Select a day
    await user.click(screen.getByText('Select Day'));
    expect(screen.getByTestId('selected-day')).not.toHaveTextContent('none');
  });

  it('closes modal', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));
    await waitFor(() => {
      expect(Number(screen.getByTestId('forecast-count').textContent)).toBeGreaterThanOrEqual(5);
    });

    await user.click(screen.getByText('Select Day'));
    expect(screen.getByTestId('selected-day')).not.toHaveTextContent('none');

    await user.click(screen.getByText('Close Modal'));
    expect(screen.getByTestId('selected-day')).toHaveTextContent('none');
  });

  it('clears error', async () => {
    const user = userEvent.setup();

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    // Trigger an error
    await user.click(screen.getByText('Fetch Empty'));
    expect(screen.getByTestId('error')).not.toHaveTextContent('none');

    // Clear the error
    await user.click(screen.getByText('Clear Error'));
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('loads recent searches from localStorage on mount', () => {
    localStorage.setItem(
      'weather-informer-recent-searches',
      JSON.stringify(['Denver', 'Seattle'])
    );

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    expect(screen.getByTestId('recent-searches')).toHaveTextContent(
      'Denver,Seattle'
    );
  });

  it('persists recent searches to localStorage', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      const stored = localStorage.getItem('weather-informer-recent-searches');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toContain('Austin, TX');
    });
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem(
      'weather-informer-recent-searches',
      'not valid json{{{}'
    );

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    // Should start with empty searches, not crash
    expect(screen.getByTestId('recent-searches')).toHaveTextContent('');
  });

  it('handles non-array localStorage data gracefully', () => {
    localStorage.setItem(
      'weather-informer-recent-searches',
      JSON.stringify({ not: 'an array' })
    );

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    expect(screen.getByTestId('recent-searches')).toHaveTextContent('');
  });

  it('handles localStorage with non-string items gracefully', () => {
    localStorage.setItem(
      'weather-informer-recent-searches',
      JSON.stringify([123, null, 'valid'])
    );

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    // Should reject because array contains non-strings
    expect(screen.getByTestId('recent-searches')).toHaveTextContent('');
  });

  it('limits recent searches to 5 entries', async () => {
    const user = userEvent.setup();
    // Pre-populate with 5 searches
    localStorage.setItem(
      'weather-informer-recent-searches',
      JSON.stringify(['A', 'B', 'C', 'D', 'E'])
    );

    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Zip'));

    await waitFor(() => {
      const searches = screen.getByTestId('recent-searches').textContent!.split(',');
      expect(searches.length).toBeLessThanOrEqual(5);
    });
  });

  it('maps weather condition for theming on successful fetch', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    // Ensure first day is 'Clear'
    mockResponse.list[4].weather[0].main = 'Clear'; // 12:00 entry

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    await user.click(screen.getByText('Fetch Austin'));

    await waitFor(() => {
      expect(screen.getByTestId('condition')).toHaveTextContent('Clear');
    });
  });

  it('sets loading to true during fetch', async () => {
    // Create a delayed response to catch loading state
    let resolveResponse: (value: unknown) => void;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    mockFetch.mockReturnValueOnce(responsePromise);

    render(
      <WeatherProvider>
        <TestConsumer />
      </WeatherProvider>
    );

    // Trigger fetch
    await act(async () => {
      screen.getByText('Fetch Austin').click();
    });

    // Loading should be true while waiting
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Resolve the fetch
    const mockResponse = createMockOWMResponse();
    await act(async () => {
      resolveResponse!({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });

    // Loading should be false after response
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });
});
