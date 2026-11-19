import type { Cell } from '@tanstack/table-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { AdjustClosingMoreColumnCell } from '@/adjustments/closing/components/AdjustClosingMoreColumn';
import type { IAdjustClosing } from '@/adjustments/closing/types/AdjustClosing';

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock(
  'erxes-ui',
  () => {
    const react = jest.requireActual<typeof import('react')>('react');
    return {
      RecordTable: {
        MoreButton: (props: React.ComponentProps<'button'>) =>
          react.createElement('button', { ...props, 'aria-label': 'more' }),
      },
    };
  },
  { virtual: true },
);

describe('closing list more button', () => {
  it('opens the closing detail directly', () => {
    const cell = {
      row: { original: { _id: 'closing-1' } },
    } as unknown as Cell<IAdjustClosing, unknown>;

    render(<AdjustClosingMoreColumnCell cell={cell} />);
    fireEvent.click(screen.getByRole('button', { name: 'more' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/accounting/adjustment/closing/closing-1',
    );
  });
});
