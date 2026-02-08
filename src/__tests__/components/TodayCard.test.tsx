/**
 * Tests for TodayCard component.
 * Covers rendering, data display, click behavior, and conditional elements.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodayCard } from '../../components/TodayCard';
import { createMockDayForecast } from '../mocks/weatherData';

describe('TodayCard', () => {
  const mockDay = createMockDayForecast({
    dayName: 'Today',
    date: '2024-01-17',
    tempHigh: 78,
    tempLow: 62,
    description: 'clear sky',
    humidity: 55,
    windSpeed: 8,
    hourly: [
      {
        time: '12:00 PM',
        temp: 72,
        feelsLike: 70,
        humidity: 50,
        windSpeed: 8,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
        pop: 15,
      },
    ],
  });

  it('renders "Today" as the heading', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders the formatted full date', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText(/January 17/)).toBeInTheDocument();
  });

  it('renders high and low temperatures', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('78°')).toBeInTheDocument();
    expect(screen.getByText('62°')).toBeInTheDocument();
  });

  it('renders the weather description', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });

  it('renders feels-like temperature from first hourly entry', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText('Feels like 70°F')).toBeInTheDocument();
  });

  it('renders humidity and wind stats', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText(/55%/)).toBeInTheDocument();
    expect(screen.getByText(/8 mph/)).toBeInTheDocument();
  });

  it('renders precipitation chance when > 0', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('does not render precipitation when 0', () => {
    const noPrecipDay = createMockDayForecast({
      ...mockDay,
      hourly: [{ ...mockDay.hourly[0], pop: 0 }],
    });
    render(<TodayCard day={noPrecipDay} onClick={() => {}} />);
    // Only humidity and wind should show, no precipitation
    const spans = screen.getAllByTitle(/./);
    const precipSpan = spans.find((s) => s.getAttribute('title') === 'Precipitation chance');
    expect(precipSpan).toBeUndefined();
  });

  it('handles empty hourly array gracefully', () => {
    const noHourly = createMockDayForecast({ hourly: [] });
    render(<TodayCard day={noHourly} onClick={() => {}} />);
    // Should not crash and should still show basic info
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders weather icon', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    const icon = screen.getByAltText('clear sky');
    expect(icon).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/01d@2x.png'
    );
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TodayCard day={mockDay} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has an accessible label', () => {
    render(<TodayCard day={mockDay} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining("Today's forecast"));
  });
});
