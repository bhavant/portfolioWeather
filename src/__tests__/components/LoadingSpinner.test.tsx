/**
 * Tests for LoadingSpinner component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with loading status role', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading weather data')).toBeInTheDocument();
  });

  it('displays loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Fetching weather data...')).toBeInTheDocument();
  });
});
