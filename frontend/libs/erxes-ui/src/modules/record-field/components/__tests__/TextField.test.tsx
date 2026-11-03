/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { TextField } from '../TextField';
jest.mock('erxes-ui/components', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
  TextOverflowTooltip: ({ value }: { value?: string }) => <span>{value}</span>,
}));
jest.mock('erxes-ui/modules/record-table', () => ({
  RecordTableInlineCell: {
    Trigger: ({ children }: React.PropsWithChildren) => (
      <button>{children}</button>
    ),
    Content: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  },
}));
it('shows a placeholder for an empty string without replacing a saved value', () => {
  const { rerender } = render(<TextField value="" placeholder="First name" />);
  expect(screen.getByRole('button', { name: 'First name' })).toBeTruthy();
  rerender(<TextField value="Zolbayar" placeholder="First name" />);
  expect(screen.getByRole('button', { name: 'Zolbayar' })).toBeTruthy();
});
