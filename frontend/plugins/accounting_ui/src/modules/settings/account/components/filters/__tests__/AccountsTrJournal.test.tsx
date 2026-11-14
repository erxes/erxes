import { fireEvent, render, screen } from '@testing-library/react';
import {
  AccountsTrJournalCommand,
  SelectAccountTrJournalCommand,
} from '@/settings/account/components/filters/AccountsTrJournal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('erxes-ui', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Combobox: {
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
    Content: () => null,
    Check: ({ checked }: { checked: boolean }) =>
      checked ? <span>selected</span> : null,
  },
  Command: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Input: () => null,
      List: 'div',
      Item: ({
        children,
        onSelect,
      }: {
        children: React.ReactNode;
        onSelect: () => void;
      }) => <button onClick={onSelect}>{children}</button>,
    },
  ),
}));

describe('transaction journal filter', () => {
  test('choosing a journal a user creates narrows the list to it', () => {
    const onSelect = jest.fn();
    render(<AccountsTrJournalCommand selected={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'bank' }));

    expect(onSelect).toHaveBeenCalledWith('bank');
  });

  test('journals the system generates are not offered', () => {
    render(<AccountsTrJournalCommand selected={null} />);

    expect(screen.queryByText('sales-inventory-issue')).toBeNull();
  });

  test('tax stays filterable even though it cannot be added from the menu', () => {
    render(<AccountsTrJournalCommand selected={null} />);

    expect(screen.getByRole('button', { name: 'tax' })).toBeTruthy();
  });

  test('the filter bar chip names the journal from a shared link', () => {
    render(<SelectAccountTrJournalCommand selected="bank" />);

    expect(screen.getByRole('button', { name: 'bank' })).toBeTruthy();
  });

  test('the filter bar chip keeps a generated journal readable from an old link', () => {
    render(<SelectAccountTrJournalCommand selected="invSaleOut" />);

    expect(
      screen.getByRole('button', { name: 'sales-inventory-issue' }),
    ).toBeTruthy();
  });

  test('the filter bar chip falls back to all when nothing is chosen', () => {
    render(<SelectAccountTrJournalCommand selected={null} />);

    expect(screen.getByRole('button', { name: 'all' })).toBeTruthy();
  });
});
