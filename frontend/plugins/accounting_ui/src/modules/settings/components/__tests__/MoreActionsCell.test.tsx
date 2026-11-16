import { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MoreActionsCell } from '@/settings/components/SettingsRowsTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { createContext, useContext, useState } =
    jest.requireActual<typeof import('react')>('react');
  const OpenContext = createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
  }>({ open: false, setOpen: () => undefined });

  const Popover = Object.assign(
    ({
      open,
      onOpenChange,
      children,
    }: {
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      children: ReactNode;
    }) => {
      const [innerOpen, setInnerOpen] = useState(false);
      const isOpen = open ?? innerOpen;
      const setOpen = (next: boolean) => {
        setInnerOpen(next);
        onOpenChange?.(next);
      };

      return (
        <OpenContext.Provider value={{ open: isOpen, setOpen }}>
          {children}
        </OpenContext.Provider>
      );
    },
    {
      Trigger: ({ children }: { children: ReactNode }) => {
        const { open, setOpen } = useContext(OpenContext);

        return <div onClick={() => setOpen(!open)}>{children}</div>;
      },
    },
  );

  return {
    Popover,
    Combobox: {
      Content: ({ children }: { children: ReactNode }) =>
        useContext(OpenContext).open ? <div role="menu">{children}</div> : null,
    },
    Command: Object.assign(
      ({ children }: { children: ReactNode }) => children,
      {
        List: ({ children }: { children: ReactNode }) => children,
        Item: ({
          children,
          onSelect,
        }: {
          children: ReactNode;
          onSelect: () => void;
        }) => <button onClick={onSelect}>{children}</button>,
      },
    ),
    RecordTable: { MoreButton: () => <button>more</button> },
  };
});
jest.mock('@/layout/components/AccountingEmptyState', () => ({
  AccountingEmptyState: () => null,
}));

const openMenu = () =>
  fireEvent.click(screen.getByRole('button', { name: 'more' }));

test('choosing edit opens the record and closes the row menu', () => {
  const onEdit = jest.fn();
  render(<MoreActionsCell onEdit={onEdit} onDelete={jest.fn()} />);

  openMenu();
  fireEvent.click(screen.getByRole('button', { name: /edit/ }));

  expect(onEdit).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('menu')).toBeNull();
});

test('choosing delete asks to delete and closes the row menu', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(<MoreActionsCell onEdit={onEdit} onDelete={onDelete} />);

  openMenu();
  fireEvent.click(screen.getByRole('button', { name: /delete/ }));

  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onEdit).not.toHaveBeenCalled();
  expect(screen.queryByRole('menu')).toBeNull();
});
