/**
 * Tests for ErrorMessage component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../../components/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message text', () => {
    render(<ErrorMessage message="Something went wrong" onDismiss={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<ErrorMessage message="Error occurred" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={onDismiss} />);

    const dismissBtn = screen.getByLabelText('Dismiss error');
    await user.click(dismissBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders the dismiss button', () => {
    render(<ErrorMessage message="Error" onDismiss={() => {}} />);
    expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument();
  });
});
