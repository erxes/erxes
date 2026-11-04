import { fireEvent, render, screen } from '@testing-library/react';
import { AccountsTrStatusCommand } from '@/settings/account/components/filters/AccountsTrStatus';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('~/modules/transactions/types/constants', () => ({
  TR_STATUSES: { ALL: ['real', 'rejeced'] },
  TR_STATUS_LABELS: { real: 'real-label', rejeced: 'rejected' },
}));

jest.mock('erxes-ui', () => ({
  Combobox: {
    Check: ({ checked }: { checked?: boolean }) => (
      <span>{checked ? 'selected' : ''}</span>
    ),
  },
  Command: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Input: () => null,
      List: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
      Item: ({
        children,
        onSelect,
      }: {
        children: React.ReactNode;
        onSelect: () => void;
      }) => <button onClick={onSelect}>{children}</button>,
    },
  ),
  Popover: Object.assign(() => null, {}),
}));

const countOptions = {
  statuses: ['draft', 'done', 'published'],
  labels: { draft: 'draft', done: 'done', published: 'published' },
};

test('a count filter offers count statuses instead of transaction statuses', () => {
  render(<AccountsTrStatusCommand selected={null} {...countOptions} />);
  expect(screen.getByRole('button', { name: 'published' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'real-label' })).toBeNull();
});

test('transaction filters keep their own statuses by default', () => {
  render(<AccountsTrStatusCommand selected={null} />);
  expect(screen.getByRole('button', { name: 'rejected' })).toBeTruthy();
});

test('a user can add a second status and then clear both one by one', () => {
  const onSelect = jest.fn();
  const { rerender } = render(
    <AccountsTrStatusCommand
      selected={['draft']}
      onSelect={onSelect}
      {...countOptions}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /^done/ }));
  expect(onSelect).toHaveBeenLastCalledWith(['draft', 'done']);

  rerender(
    <AccountsTrStatusCommand
      selected={['draft', 'done']}
      onSelect={onSelect}
      {...countOptions}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^draft/ }));
  expect(onSelect).toHaveBeenLastCalledWith(['done']);

  rerender(
    <AccountsTrStatusCommand
      selected={['done']}
      onSelect={onSelect}
      {...countOptions}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^done/ }));
  expect(onSelect).toHaveBeenLastCalledWith(null);
});
