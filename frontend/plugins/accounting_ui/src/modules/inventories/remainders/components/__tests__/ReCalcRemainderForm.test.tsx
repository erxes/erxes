import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { ReCalcRemainderForm } from '@/inventories/remainders/components/ReCalcRemainderForm';
import { useReCalcRemainders } from '@/inventories/remainders/hooks/useReCalcRemainders';

jest.mock('@/inventories/remainders/hooks/useReCalcRemainders');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));
jest.mock('jotai', () => ({ atom: () => ({}), useAtomValue: () => [] }));
jest.mock('~/modules/layout/components/Sheet', () => ({
  AccountingSheet: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock('ui-modules', () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Select = Object.assign(Container, {
    Value: () => <span>Selected location</span>,
    Command: () => null,
  });
  return {
    SelectBranches: Select,
    SelectDepartments: Select,
    SelectCategory: () => null,
  };
});
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Button = (props: ComponentProps<'button'>) => (
    <button type="button" {...props} />
  );
  const Form = Object.assign(
    ({ children, ...props }: ComponentProps<typeof FormProvider>) => (
      <FormProvider {...props}>{children}</FormProvider>
    ),
    {
      Field: Controller,
      Item: Container,
      Label: Container,
      Control: Container,
      Message: () => null,
    },
  );
  return {
    Button,
    Form,
    Spinner: () => null,
    useMultiQueryState: () => [{}],
    Sheet: Object.assign(Container, { Trigger: Container, Footer: Container }),
    Popover: Container,
    Combobox: {
      Trigger: Button,
      Content: Container,
      Value: ({ placeholder }: { placeholder?: string }) => (
        <span>{placeholder}</span>
      ),
    },
  };
});

const recalculate = jest.fn();
beforeEach(() => {
  recalculate.mockReset();
  jest
    .mocked(useReCalcRemainders)
    .mockReturnValue({ addSafeRemainder: recalculate, loading: false });
});
const run = async (branchId: string, departmentId: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'run' }));
  await waitFor(() =>
    expect(recalculate).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { branchId, departmentId } }),
    ),
  );
};

describe('recalculation location selection', () => {
  it('starts with blank filters instead of selecting unassigned locations', async () => {
    render(<ReCalcRemainderForm />);
    expect(
      screen.getByRole('button', {
        name: 'Салбар сонгогдоогүй',
        pressed: false,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Нэгж сонгогдоогүй', pressed: false }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Бүх салбар' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Бүх нэгж' })).toBeNull();
    await run('', '');
  });

  it('only submits underscores after explicitly selecting unassigned options', async () => {
    render(<ReCalcRemainderForm />);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Салбар сонгогдоогүй',
        pressed: false,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Нэгж сонгогдоогүй', pressed: false }),
    );
    await run('_', '_');
  });

  it('clears the branch independently while preserving the unassigned department filter', async () => {
    render(<ReCalcRemainderForm />);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Салбар сонгогдоогүй',
        pressed: false,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Нэгж сонгогдоогүй', pressed: false }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Салбар сонгогдоогүй',
        pressed: true,
      }),
    );
    await run('', '_');
  });
});
