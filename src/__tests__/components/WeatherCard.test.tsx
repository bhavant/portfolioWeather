/**
 * Tests for WeatherCard component.
 * Covers rendering, data display, and click behavior.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherCard } from '../../components/WeatherCard';
import { createMockDayForecast } from '../mocks/weatherData';

describe('WeatherCard', () => {
  const mockDay = createMockDayForecast({
    dayName: 'Wednesday',
    date: '2024-01-17',
    tempHigh: 78,
    tempLow: 62,
    description: 'clear sky',
    humidity: 55,
    windSpeed: 8,
  });

  it('renders the day name', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
  });

  it('renders high and low temperatures', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('78°')).toBeInTheDocument();
    expect(screen.getByText('62°')).toBeInTheDocument();
  });

  it('renders the weather description', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });

  it('renders humidity and wind speed', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText(/55%/)).toBeInTheDocument();
    expect(screen.getByText(/8 mph/)).toBeInTheDocument();
  });

  it('renders the formatted date', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('Jan 17')).toBeInTheDocument();
  });

  it('renders weather icon with alt text', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    const icon = screen.getByAltText('clear sky');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/01d@2x.png'
    );
  });

  it('calls onClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<WeatherCard day={mockDay} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible label with forecast summary', () => {
    render(<WeatherCard day={mockDay} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Wednesday'));
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('78'));
  });
});
