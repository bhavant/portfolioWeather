/**
 * Tests for WeatherModal component.
 * Covers rendering, close interactions (X button, backdrop click, Escape key),
 * and hourly data display.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherModal } from '../../components/WeatherModal';
import { createMockDayForecast } from '../mocks/weatherData';

describe('WeatherModal', () => {
  const mockDay = createMockDayForecast({
    dayName: 'Wednesday',
    date: '2024-01-17',
    tempHigh: 78,
    tempLow: 62,
    description: 'clear sky',
    hourly: [
      {
        time: '9:00 AM',
        temp: 65,
        feelsLike: 63,
        humidity: 50,
        windSpeed: 5,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
        pop: 0,
      },
      {
        time: '12:00 PM',
        temp: 72,
        feelsLike: 70,
        humidity: 45,
        windSpeed: 8,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
        pop: 10,
      },
      {
        time: '3:00 PM',
        temp: 78,
        feelsLike: 76,
        humidity: 40,
        windSpeed: 10,
        condition: 'Clouds',
        description: 'few clouds',
        icon: '02d',
        pop: 20,
      },
    ],
  });

  afterEach(() => {
    // Ensure body overflow is restored
    document.body.style.overflow = '';
  });

  it('renders the modal with dialog role', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the day name and date', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    // Check for formatted date
    expect(
      screen.getByText(/January 17/)
    ).toBeInTheDocument();
  });

  it('displays high/low temperatures', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByText(/78° \/ 62°/)).toBeInTheDocument();
  });

  it('renders all hourly entries', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('3:00 PM')).toBeInTheDocument();
  });

  it('displays hourly temperature data', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByText('65°F')).toBeInTheDocument();
    expect(screen.getByText('72°F')).toBeInTheDocument();
    expect(screen.getByText('78°F')).toBeInTheDocument();
  });

  it('displays feels-like temperatures', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByText('Feels 63°')).toBeInTheDocument();
    expect(screen.getByText('Feels 70°')).toBeInTheDocument();
    expect(screen.getByText('Feels 76°')).toBeInTheDocument();
  });

  it('closes when the X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WeatherModal day={mockDay} onClose={onClose} />);

    await user.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside the modal (backdrop)', async () => {
    const onClose = vi.fn();
    render(<WeatherModal day={mockDay} onClose={onClose} />);

    // Click the backdrop (the outermost div with modal-backdrop class)
    const backdrop = screen.getByRole('dialog').parentElement || screen.getByRole('dialog');
    fireEvent.click(backdrop);
    // The dialog itself is the backdrop container
    const dialogEl = screen.getByRole('dialog');
    fireEvent.click(dialogEl);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<WeatherModal day={mockDay} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when mounted', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when unmounted', () => {
    const { unmount } = render(
      <WeatherModal day={mockDay} onClose={() => {}} />
    );
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('has an accessible label describing the content', () => {
    render(<WeatherModal day={mockDay} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('January 17')
    );
  });
});
