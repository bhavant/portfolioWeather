/**
 * Tests for RecentSearches component.
 * Covers rendering, click behavior, and empty state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentSearches } from '../../components/RecentSearches';

describe('RecentSearches', () => {
  it('renders nothing when searches array is empty', () => {
    const { container } = render(
      <RecentSearches searches={[]} onSelect={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders all search terms as clickable pills', () => {
    const searches = ['Austin, TX', 'New York', '90210'];
    render(<RecentSearches searches={searches} onSelect={() => {}} />);

    searches.forEach((term) => {
      expect(screen.getByText(term)).toBeInTheDocument();
    });
  });

  it('renders the section label', () => {
    render(
      <RecentSearches searches={['Austin']} onSelect={() => {}} />
    );
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
  });

  it('calls onSelect with the correct search term when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RecentSearches
        searches={['Austin', 'Denver', 'Seattle']}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText('Denver'));
    expect(onSelect).toHaveBeenCalledWith('Denver');
  });

  it('renders items with listitem role', () => {
    render(
      <RecentSearches searches={['Austin', 'Denver']} onSelect={() => {}} />
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('has an accessible list container', () => {
    render(
      <RecentSearches searches={['Austin']} onSelect={() => {}} />
    );
    expect(screen.getByRole('list', { name: 'Recent searches' })).toBeInTheDocument();
  });
});
