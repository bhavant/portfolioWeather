/**
 * Integration tests for the App component.
 * Tests the full flow: search → loading → cards → modal → close.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { createMockOWMResponse } from './mocks/weatherData';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it('renders the title', () => {
    render(<App />);
    expect(
      screen.getByText('Welcome to Weather Informer')
    ).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(
      screen.getByText(/Search any US city or zip code/)
    ).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    render(<App />);
    expect(
      screen.getByLabelText('Search city or zip code')
    ).toBeInTheDocument();
  });

  it('shows empty state when no data is loaded', () => {
    render(<App />);
    expect(
      screen.getByText(/Enter a city or zip code above to get started/)
    ).toBeInTheDocument();
  });

  it('performs full search flow: type → submit → display cards', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    // Type in search
    const input = screen.getByLabelText('Search city or zip code');
    await user.type(input, 'Austin, TX');

    // Submit
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Wait for forecast cards to render
    await waitFor(() => {
      expect(screen.getByText('Austin, US')).toBeInTheDocument();
    });

    // Should have 5 forecast card buttons
    const cardButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.includes('forecast')
    );
    expect(cardButtons.length).toBe(5);
  });

  it('opens modal when a forecast card is clicked', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    // Search
    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Wait for cards
    await waitFor(() => {
      expect(screen.getByText('Austin, US')).toBeInTheDocument();
    });

    // Click first forecast card
    const cardButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.includes('forecast')
    );
    await user.click(cardButtons[0]);

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when X button is clicked', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Austin, US')).toBeInTheDocument();
    });

    // Open modal
    const cardButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.includes('forecast')
    );
    await user.click(cardButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal via X button
    await user.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when Escape is pressed', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Austin, US')).toBeInTheDocument();
    });

    const cardButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.includes('forecast')
    );
    await user.click(cardButtons[0]);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'City not found' }),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'InvalidCity');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('City not found')).toBeInTheDocument();
    });
  });

  it('dismisses error message when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'City not found' }),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'BadCity');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('City not found')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Dismiss error'));
    expect(screen.queryByText('City not found')).not.toBeInTheDocument();
  });

  it('shows recent searches after a successful search', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin, TX');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    });
  });

  it('applies dynamic background based on weather condition', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();
    // Ensure midday entry has 'Clear' condition
    mockResponse.list.forEach((item) => {
      if (item.dt_txt.includes('12:00:00')) {
        item.weather[0].main = 'Clear';
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      // Check that the main container has gradient classes
      const container = screen.getByText('Welcome to Weather Informer').closest('div[class*="bg-gradient"]');
      expect(container).toBeInTheDocument();
    });
  });

  it('triggers search when recent search pill is clicked', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockOWMResponse();

    // First search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);

    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin, TX');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    });

    // Set up second fetch mock for the re-search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Click the recent search pill
    const pill = screen.getByRole('listitem');
    await user.click(pill);

    // Should have triggered another fetch
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
