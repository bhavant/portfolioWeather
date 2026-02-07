/**
 * Tests for ForecastCards component.
 * Covers rendering of multiple cards and click delegation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForecastCards } from '../../components/ForecastCards';
import { createMockFiveDayForecast } from '../mocks/weatherData';

describe('ForecastCards', () => {
  const mockForecast = createMockFiveDayForecast();

  it('renders 5 weather cards', () => {
    render(<ForecastCards forecast={mockForecast} onCardClick={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('renders all day names', () => {
    render(<ForecastCards forecast={mockForecast} onCardClick={() => {}} />);
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
  });

  it('calls onCardClick with the correct day when a card is clicked', async () => {
    const user = userEvent.setup();
    const onCardClick = vi.fn();
    render(
      <ForecastCards forecast={mockForecast} onCardClick={onCardClick} />
    );

    // Click the second card (Tuesday)
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    expect(onCardClick).toHaveBeenCalledWith(mockForecast[1]);
  });

  it('renders an empty container when forecast is empty', () => {
    const { container } = render(
      <ForecastCards forecast={[]} onCardClick={() => {}} />
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
