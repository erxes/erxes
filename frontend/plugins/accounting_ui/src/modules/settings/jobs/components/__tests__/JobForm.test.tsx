import { act, render, screen, within } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import type { TJobForm } from '../../types/Job';
import { JobForm } from '../JobForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    loading: false,
    data: {
      productsMain: {
        list: [
          { _id: 'input', uom: 'kg', subUoms: [{ uom: 'box', ratio: 5 }] },
          { _id: 'output', uom: 'ea', subUoms: [{ uom: 'pack', ratio: 2 }] },
        ],
      },
      uoms: [],
    },
  }),
}));
jest.mock('../../graphql/jobQueries', () => ({
  GET_JOB_PRODUCT_UNITS: {},
}));
jest.mock('../JobCosts', () => ({ JobCosts: () => null }));
jest.mock('ui-modules', () => ({ SelectProduct: () => null }));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Wrapper = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    Form: Object.assign(Wrapper, {
      Field: () => null,
      Label: 'label',
      Message: () => null,
    }),
    Button: ({
      children,
      onClick,
      type,
      disabled,
    }: ComponentProps<'button'>) => (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    Input: 'input',
    Textarea: 'textarea',
    Select: 'select',
    Sheet: { Footer: Wrapper, Close: Wrapper },
    Spinner: () => null,
    RecordTableInlineCell: Wrapper,
    Table: Object.assign(
      (props: ComponentProps<'table'>) => <table {...props} />,
      { Header: 'thead', Row: 'tr', Head: 'th', Body: 'tbody', Cell: 'td' },
    ),
  };
});

test('edit bootstrap and later resets tolerate unset product arrays without overwriting saved units', () => {
  let form: UseFormReturn<TJobForm> | undefined;
  const Harness = () => {
    const currentForm = useForm<TJobForm>();
    form = currentForm;
    return <JobForm form={currentForm} onSubmit={jest.fn()} loading={false} />;
  };
  expect(() => render(<Harness />)).not.toThrow();
  if (!form) throw new Error('Form did not mount');
  const mountedForm = form;
  act(() =>
    mountedForm.reset({
      name: 'Loaded card',
      durationType: 'real',
      laborCosts: [],
      overheadCosts: [],
      inputs: [{ productId: 'input', quantity: 1, uom: 'saved-unit' }],
      outputs: [{ productId: 'output', quantity: 1, costRatio: 1 }],
    }),
  );
  expect(mountedForm.getValues('inputs.0.uom')).toBe('saved-unit');
  expect(mountedForm.getValues('outputs.0.uom')).toBe('ea');
  expect(() =>
    act(() => mountedForm.reset({ name: 'Next card', durationType: 'real' })),
  ).not.toThrow();
});

test('embedded job tables do not create nested HTML forms or per-job save footers', () => {
  const Embedded = () => {
    const form = useForm<TJobForm>({
      defaultValues: {
        name: 'Job',
        durationType: 'real',
        inputs: [],
        outputs: [],
        laborCosts: [],
        overheadCosts: [],
      },
    });
    return (
      <JobForm
        form={form}
        loading={false}
        hideSettings
        embedded
        onSubmit={jest.fn()}
      />
    );
  };
  const { container, queryByText } = render(
    <form>
      <Embedded />
      <Embedded />
    </form>,
  );
  expect(container.querySelectorAll('form')).toHaveLength(1);
  expect(queryByText('save')).toBeNull();
  expect(queryByText('cancel')).toBeNull();
});

test('execution mode converts copied input and output units once and preserves later actual edits', () => {
  let form: UseFormReturn<TJobForm> | undefined;
  const Harness = () => {
    const currentForm = useForm<TJobForm>({
      defaultValues: {
        name: 'Job',
        durationType: 'real',
        laborCosts: [],
        overheadCosts: [],
        inputs: [{ productId: 'input', uom: 'box', quantity: 6 }],
        outputs: [
          { productId: 'output', uom: 'pack', quantity: 3, costRatio: 2 },
        ],
      },
    });
    form = currentForm;
    return (
      <JobForm
        form={currentForm}
        loading={false}
        onSubmit={jest.fn()}
        baseUnitsOnly
        readOnlyCostRatio
        embedded
        hideSettings
      />
    );
  };
  render(<Harness />);
  const inputsTable = screen.getByRole('table', { name: 'job-input-products' });
  const outputsTable = screen.getByRole('table', {
    name: 'job-output-products',
  });
  expect(
    within(inputsTable)
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent),
  ).toEqual(['product', 'job-unit', 'quantity', 'job-remove-row']);
  expect(
    within(outputsTable)
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent),
  ).toEqual([
    'product',
    'job-cost-ratio',
    'job-unit',
    'quantity',
    'job-remove-row',
  ]);
  const ratioCell = within(outputsTable).getAllByRole('cell')[1];
  expect(ratioCell.textContent).toBe('2');
  expect(ratioCell.querySelector('button, input')).toBeNull();
  if (!form) throw new Error('Form did not mount');
  const mounted = form;
  expect(mounted.getValues('inputs.0')).toMatchObject({
    uom: 'kg',
    quantity: 30,
  });
  expect(mounted.getValues('outputs.0')).toMatchObject({
    uom: 'ea',
    quantity: 6,
    costRatio: 2,
  });
  act(() => mounted.setValue('inputs.0.quantity', 31));
  expect(mounted.getValues('inputs.0.quantity')).toBe(31);
  act(() =>
    mounted.reset({
      ...mounted.getValues(),
      inputs: [{ productId: 'input', uom: 'box', quantity: 12 }],
    }),
  );
  expect(mounted.getValues('inputs.0')).toMatchObject({
    uom: 'kg',
    quantity: 60,
  });
  expect(mounted.getValues('outputs.0.quantity')).toBe(6);
});
