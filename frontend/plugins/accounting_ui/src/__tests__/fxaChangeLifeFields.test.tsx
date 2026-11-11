import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useForm, ControllerProps } from 'react-hook-form';
import { FxaChangeLifeFields } from '@/transactions/transaction-form/components/forms/FxaChangeFields';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  return {
    Form: {
      Field: (props: ControllerProps<TAddTransactionGroup>) =>
        react.createElement(Controller<TAddTransactionGroup>, props),
      Item: wrapper,
      Label: wrapper,
      Control: wrapper,
      Message: () => null,
    },
    Input: (props: React.ComponentProps<'input'>) =>
      react.createElement('input', props),
  };
});

test.each([false, true])(
  'years and stored annual percentage stay synchronized (tax=%s)',
  (tax) => {
    const { result } = renderHook(() =>
      useForm<TAddTransactionGroup>({
        defaultValues: {
          trDocs: [
            {
              journal: TrJournalEnum.FXA_INCOME,
              details: [
                {
                  followInfos: {
                    annualDepreciationRate: 12.5,
                    taxAnnualDepreciationRate: 12.5,
                  },
                },
              ],
            },
          ],
        },
      }),
    );
    render(
      <FxaChangeLifeFields
        form={result.current}
        index={0}
        detailIndex={0}
        tax={tax}
      />,
    );
    const years = screen.getByLabelText(
      tax ? 'tax-useful-life-in-years' : 'useful-life-in-years',
    );
    const rate = screen.getByLabelText(
      tax ? 'annual-tax-depreciation-rate' : 'annual-depreciation-rate',
    );
    expect(years).toHaveProperty('value', '8');
    expect(rate).toHaveProperty('value', '12.5');
    fireEvent.change(years, { target: { value: '5' } });
    expect(rate).toHaveProperty('value', '20');
    fireEvent.change(rate, { target: { value: '25' } });
    expect(years).toHaveProperty('value', '4');
    expect(
      result.current.getValues(
        `trDocs.0.details.0.followInfos.${
          tax ? 'taxAnnualDepreciationRate' : 'annualDepreciationRate'
        }`,
      ),
    ).toBe(25);
  },
);
