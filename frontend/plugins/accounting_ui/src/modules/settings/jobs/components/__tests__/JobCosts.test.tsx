import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import type { IJobCost, TJobForm } from '../../types/Job';
import { JobCosts } from '../JobCosts';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: () => null,
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({ children, onClick, type }: ComponentProps<'button'>) => (
      <button type={type} onClick={onClick}>
        {children}
      </button>
    ),
    Label: 'label',
    Input: 'input',
    Switch: ({
      checked,
      onCheckedChange,
      id,
    }: {
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      id: string;
    }) => (
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
    ),
    Form: { Field: () => null },
    CurrencyField: { ValueInput: 'input' },
    PopoverScoped: 'div',
    RecordTableInlineCell: { Trigger: 'button', Content: 'div' },
    Table: Object.assign(
      (props: ComponentProps<'table'>) => <table {...props} />,
      { Header: 'thead', Row: 'tr', Head: 'th', Body: 'tbody', Cell: 'td' },
    ),
  };
});

const cost: IJobCost = {
  name: 'Assembly',
  amount: 100,
  accountId: 'labor',
};

const setup = (laborCosts: IJobCost[] = []) => {
  let form: UseFormReturn<TJobForm> | undefined;
  const Harness = () => {
    const currentForm = useForm<TJobForm>({
      defaultValues: {
        name: 'Card',
        durationType: 'real',
        inputs: [],
        outputs: [],
        laborCosts,
        overheadCosts: [],
      },
    });
    form = currentForm;
    return (
      <>
        <JobCosts form={currentForm} name="laborCosts" title="Labor" />
        <JobCosts form={currentForm} name="overheadCosts" title="Overhead" />
      </>
    );
  };
  render(<Harness />);
  if (!form) throw new Error('Form did not mount');
  return form;
};

test('new empty groups start hidden and toggle independently', () => {
  setup();
  expect(screen.queryByRole('table')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Labor' }));
  expect(screen.getByRole('table', { name: 'Labor' })).toBeTruthy();
  expect(screen.queryByRole('table', { name: 'Overhead' })).toBeNull();
});

test('populated groups start enabled and hiding preserves their rows', () => {
  const form = setup([cost]);
  expect(screen.getByRole('table', { name: 'Labor' })).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Labor' }));
  expect(screen.queryByRole('table', { name: 'Labor' })).toBeNull();
  expect(form.getValues('laborCosts')).toEqual([cost]);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Labor' }));
  expect(screen.getByRole('table', { name: 'Labor' })).toBeTruthy();
});

test('asynchronous detail resets initialize each toggle from its own array', () => {
  const form = setup([cost]);
  act(() =>
    form.reset({ ...form.getValues(), laborCosts: [], overheadCosts: [cost] }),
  );
  expect(screen.queryByRole('table', { name: 'Labor' })).toBeNull();
  expect(screen.getByRole('table', { name: 'Overhead' })).toBeTruthy();
  act(() =>
    form.reset({ ...form.getValues(), laborCosts: [cost], overheadCosts: [] }),
  );
  expect(screen.getByRole('table', { name: 'Labor' })).toBeTruthy();
  expect(screen.queryByRole('table', { name: 'Overhead' })).toBeNull();
});

test('validation reveals a hidden group with invalid rows', () => {
  const form = setup([cost]);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Labor' }));
  act(() => form.setError('laborCosts.0.name', { message: 'Required' }));
  expect(screen.getByRole('table', { name: 'Labor' })).toBeTruthy();
});
