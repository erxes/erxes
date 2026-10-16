import { act, render } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import type { TTechCardForm } from '../../types/TechCard';
import { TechCardForm } from '../TechCardForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    loading: false,
    data: {
      productsMain: {
        list: [
          { _id: 'input', uom: 'kg' },
          { _id: 'output', uom: 'ea' },
        ],
      },
      uoms: [],
    },
  }),
}));
jest.mock('../../graphql/techCardQueries', () => ({
  GET_TECH_CARD_PRODUCT_UNITS: {},
}));
jest.mock('../TechCardCosts', () => ({ TechCardCosts: () => null }));
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
    Table: Object.assign(
      (props: ComponentProps<'table'>) => <table {...props} />,
      { Header: 'thead', Row: 'tr', Head: 'th', Body: 'tbody', Cell: 'td' },
    ),
  };
});

test('edit bootstrap and later resets tolerate unset product arrays without overwriting saved units', () => {
  let form: UseFormReturn<TTechCardForm> | undefined;
  const Harness = () => {
    const currentForm = useForm<TTechCardForm>();
    form = currentForm;
    return (
      <TechCardForm form={currentForm} onSubmit={jest.fn()} loading={false} />
    );
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
