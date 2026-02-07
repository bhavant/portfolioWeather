/**
 * Tests for SearchBar component.
 * Covers input validation, submit behavior, disabled states, and keyboard interaction.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../components/SearchBar';

describe('SearchBar', () => {
  it('renders input field and submit button', () => {
    render(<SearchBar onSearch={() => {}} loading={false} />);
    expect(screen.getByLabelText('Search city or zip code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<SearchBar onSearch={() => {}} loading={false} />);
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('submit button is enabled with valid city input', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} loading={false} />);
    await user.type(screen.getByLabelText('Search city or zip code'), 'Austin');
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled();
  });

  it('submit button is enabled with valid zip code', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} loading={false} />);
    await user.type(screen.getByLabelText('Search city or zip code'), '90210');
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled();
  });

  it('submit button remains disabled with invalid input', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} loading={false} />);
    await user.type(screen.getByLabelText('Search city or zip code'), '123');
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('shows validation error for invalid input after typing', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} loading={false} />);
    await user.type(screen.getByLabelText('Search city or zip code'), '12@#');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show validation error for empty input before typing', () => {
    render(<SearchBar onSearch={() => {}} loading={false} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onSearch with sanitized input on submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} loading={false} />);

    await user.type(screen.getByLabelText('Search city or zip code'), '  Austin, TX  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith('Austin, TX');
  });

  it('clears input after successful submit', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} loading={false} />);

    const input = screen.getByLabelText('Search city or zip code');
    await user.type(input, 'Austin');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(input).toHaveValue('');
  });

  it('supports Enter key to submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} loading={false} />);

    const input = screen.getByLabelText('Search city or zip code');
    await user.type(input, 'Denver{Enter}');

    expect(onSearch).toHaveBeenCalledWith('Denver');
  });

  it('disables submit button during loading', () => {
    render(<SearchBar onSearch={() => {}} loading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onSearch when input is invalid and form is submitted', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} loading={false} />);

    // Type invalid input and try to submit via Enter
    await user.type(screen.getByLabelText('Search city or zip code'), '!!invalid!!{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows placeholder text', () => {
    render(<SearchBar onSearch={() => {}} loading={false} />);
    expect(
      screen.getByPlaceholderText('Enter US city or zip code...')
    ).toBeInTheDocument();
  });
});
