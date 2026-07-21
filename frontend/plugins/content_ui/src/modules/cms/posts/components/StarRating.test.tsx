import { render, screen } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders five accessible stars with the requested value filled', () => {
    const { container } = render(
      <StarRating value={3} label="3 out of 5 stars" />,
    );

    expect(screen.getByRole('img', { name: '3 out of 5 stars' })).toBeTruthy();
    expect(container.querySelectorAll('svg')).toHaveLength(5);
    expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-filled="false"]')).toHaveLength(2);
  });

  it('renders fractional averages with a half star', () => {
    const { container } = render(
      <StarRating value={4.5} label="4.5 out of 5 stars" />,
    );

    expect(container.querySelectorAll('[data-state="full"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-state="half"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-state="empty"]')).toHaveLength(0);
  });
});
