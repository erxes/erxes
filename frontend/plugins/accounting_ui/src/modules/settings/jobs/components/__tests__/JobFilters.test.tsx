import { fireEvent, render, screen } from '@testing-library/react';
import { useQueryState } from 'erxes-ui';
import { JobFilters } from '../JobFilters';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { label: string }) =>
      key === 'filter-by'
        ? `Translated filter: ${values?.label}`
        : `Translated ${key}`,
  }),
}));

jest.mock('ui-modules', () => ({
  SelectProduct: {
    FilterBar: () => null,
    FilterItem: () => null,
    FilterView: () => null,
  },
}));

jest.mock('../../hooks/useJobFilters', () => ({
  useJobFilters: () => ({ hasLabor: false }),
}));

jest.mock('erxes-ui', () => ({
  Button: 'button',
  Input: 'input',
  Dialog: {
    Content: 'section',
    Header: 'header',
    Title: 'h2',
    Footer: 'footer',
  },
  Combobox: {
    Content: 'div',
    Check: ({ checked }: { checked: boolean }) => (
      <span data-testid="check">{String(checked)}</span>
    ),
  },
  Command: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    { Input: 'input', List: 'div', Item: 'button' },
  ),
  Filter: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Bar: 'div',
      BarItem: () => null,
      BarName: 'span',
      BarButton: ({ children }: { children: React.ReactNode }) => (
        <button>{children}</button>
      ),
      BarClose: () => null,
      Popover: 'div',
      Trigger: () => null,
      View: ({
        children,
        filterKey,
      }: {
        children: React.ReactNode;
        filterKey?: string;
      }) => (!filterKey || filterKey === 'laborCostName' ? children : null),
      CommandInput: () => null,
      Item: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
      Dialog: 'div',
    },
  ),
  useQueryState: jest.fn(),
  useFilterContext: () => ({ resetFilterState: jest.fn() }),
}));

jest.mock('@tabler/icons-react', () => ({
  IconCopy: () => null,
  IconClock: () => null,
  IconCircleCheck: () => null,
  IconCoin: () => null,
  IconSearch: () => null,
}));

test('duplicate-output menu is available only in the unwound list', () => {
  jest.mocked(useQueryState).mockReturnValue([null, jest.fn()]);
  const { rerender } = render(<JobFilters />);
  expect(screen.queryByText('Translated job-duplicated-output')).toBeNull();
  rerender(<JobFilters unwindOutputs />);
  expect(screen.getByText('Translated job-duplicated-output')).toBeTruthy();
});

test('localizes menu keys and text dialog title/actions while showing false filters', () => {
  const setQuery = jest.fn();
  jest.mocked(useQueryState).mockReturnValue([null, setQuery]);
  render(<JobFilters />);
  expect(
    screen.getByRole('heading', {
      name: 'Translated filter: Translated job-labor-name',
    }),
  ).toBeTruthy();
  expect(screen.getByText('Translated job-overhead-name')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Translated no' })).toBeTruthy();
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Translated job-labor-name' }),
    { target: { value: 'Assembly' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Translated apply' }));
  expect(setQuery).toHaveBeenCalledWith('Assembly');
  expect(
    screen.getByRole('button', { name: 'Translated cancel' }),
  ).toBeTruthy();
});
