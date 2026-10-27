/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { ContactPanelRelations } from '../ContactPanelRelations';

const mockManage = jest.fn();
const mockOpenRecord = jest.fn();
let mockAllowed = true;
const mockRelations = {
  relatedIds: ['company-1', 'company-2'],
  loading: false,
  error: undefined,
  refetch: jest.fn(),
};

jest.mock('ui-modules', () => ({
  useRelations: () => mockRelations,
  useManageRelations: () => ({ manageRelations: mockManage, loading: false }),
  usePermissionCheck: () => ({ hasActionPermission: () => mockAllowed }),
  useSidePanel: () => ({ openRecord: mockOpenRecord }),
  ContactRecordChip: ({ id, onOpen }: { id: string; onOpen: () => void }) => (
    <button onClick={onOpen}>{id}</button>
  ),
  PanelField: ({ children }: PropsWithChildren) => <div>{children}</div>,
  SelectCompany: {
    Provider: ({
      value,
      onValueChange,
      children,
    }: PropsWithChildren<{
      value: string[];
      onValueChange: (mockValue: string[]) => void;
    }>) => (
      <div>
        <button onClick={() => onValueChange([...value, 'company-3'])}>
          Add third
        </button>
        <button onClick={() => onValueChange([])}>Remove all</button>
        {children}
      </div>
    ),
    Content: () => null,
  },
  SelectCustomer: { Provider: () => null, Content: () => null },
}));

jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Open = React.createContext(false);
  const Change = React.createContext<(mockOpen: boolean) => void>(
    () => undefined,
  );
  const Popover = ({
    open,
    onOpenChange,
    children,
  }: PropsWithChildren<{
    open: boolean;
    onOpenChange: (mockOpen: boolean) => void;
  }>) => (
    <Open.Provider value={open}>
      <Change.Provider value={onOpenChange}>{children}</Change.Provider>
    </Open.Provider>
  );
  Popover.Trigger = ({ children }: PropsWithChildren) => {
    const change = React.useContext(Change);
    return <div onClick={() => change(true)}>{children}</div>;
  };
  return {
    Popover,
    Button: ({
      children,
      onClick,
      disabled,
      'aria-label': label,
    }: React.ComponentProps<'button'>) => (
      <button onClick={onClick} disabled={disabled} aria-label={label}>
        {children}
      </button>
    ),
    Combobox: {
      Content: ({ children }: PropsWithChildren) =>
        React.useContext(Open) ? <div>{children}</div> : null,
    },
    Spinner: () => <div role="status">Loading</div>,
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

beforeEach(() => {
  mockManage.mockReset();
  mockOpenRecord.mockReset();
  mockAllowed = true;
});

it('adds to the complete saved selection and opens related records with Back history', async () => {
  mockManage.mockResolvedValue({ data: { manageRelations: [] } });
  render(<ContactPanelRelations contentType="core:customer" contentId="c1" />);
  fireEvent.click(screen.getByRole('button', { name: 'company-1' }));
  expect(mockOpenRecord).toHaveBeenCalledWith(
    { contentType: 'core:company', contentId: 'company-1' },
    { stack: true },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Companies' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add third' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockManage).toHaveBeenCalledTimes(1));
  expect(mockManage).toHaveBeenCalledWith({
    contentType: 'core:customer',
    contentId: 'c1',
    relatedContentType: 'core:company',
    relatedContentIds: ['company-1', 'company-2', 'company-3'],
  });
  await waitFor(() => expect(screen.queryByText('Save')).toBeNull());
});

it('allows unlinking the last relation and keeps the picker open after an error', async () => {
  mockManage.mockResolvedValue({ data: undefined });
  render(<ContactPanelRelations contentType="core:customer" contentId="c1" />);
  fireEvent.click(screen.getByRole('button', { name: 'Companies' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockManage).toHaveBeenCalledTimes(1));
  expect(mockManage.mock.calls[0][0].relatedContentIds).toEqual([]);
  expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
});

it('shows linked records without editing controls when the user cannot update contacts', () => {
  mockAllowed = false;
  render(<ContactPanelRelations contentType="core:customer" contentId="c1" />);
  expect(screen.getByRole('button', { name: 'company-1' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Companies' })).toBeNull();
});
