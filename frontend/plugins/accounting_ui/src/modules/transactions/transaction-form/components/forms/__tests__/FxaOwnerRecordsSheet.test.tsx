import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useForm, ControllerProps } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { FxaOwnerRecordsSheet } from '@/transactions/transaction-form/components/forms/FxaOwnerRecordsSheet';
import { fxaOwnerRecordInputSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({
    data: {
      fxaOwnerRecords: [
        {
          _id: 'asset:old-owner',
          fixedAssetId: 'asset',
          ownerId: 'old-owner',
          count: 5,
          code: 'PC',
        },
      ],
    },
    loading: false,
  })),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  const root =
    () =>
    ({ children }: { children: React.ReactNode }) =>
      react.createElement('div', {}, children);
  return {
    cn: (...parts: string[]) => parts.join(' '),
    Form: {
      Field: (props: ControllerProps<TAddTransactionGroup>) =>
        react.createElement(Controller<TAddTransactionGroup>, props),
    },
    Sheet: Object.assign(root(), {
      Trigger: wrapper,
      View: wrapper,
      Header: wrapper,
      Title: wrapper,
      Description: wrapper,
      Content: wrapper,
      Close: () => null,
    }),
    Table: Object.assign(root(), {
      Header: wrapper,
      Row: wrapper,
      Head: wrapper,
      Body: wrapper,
      Cell: wrapper,
    }),
    RecordTable: { MoreButton: () => null },
    Checkbox: ({
      checked,
      onCheckedChange,
    }: {
      checked: boolean;
      onCheckedChange: (value: boolean) => void;
    }) =>
      react.createElement('input', {
        type: 'checkbox',
        checked,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onCheckedChange(event.target.checked),
      }),
    InputNumber: ({ value, disabled }: { value: number; disabled: boolean }) =>
      react.createElement('input', { value, disabled, readOnly: true }),
  };
});
jest.mock('ui-modules', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const ownerContext = react.createContext('');
  return {
    CustomerType: { CUSTOMER: 'customer' },
    SelectMember: {
      Provider: ({
        value,
        children,
      }: {
        value: string;
        children: React.ReactNode;
      }) => react.createElement(ownerContext.Provider, { value }, children),
      Value: () =>
        react.createElement('span', {}, react.useContext(ownerContext)),
      FormItem: ({
        value,
        onValueChange,
      }: {
        value?: string;
        onValueChange: (value: string) => void;
      }) =>
        react.createElement('input', {
          'aria-label': 'new-owner',
          value: value || '',
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onValueChange(event.target.value),
        }),
    },
  };
});

test('movement keeps the source owner while selecting and serializing a new custodian', () => {
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        trDocs: [
          {
            _id: 'move',
            parentId: 'parent',
            journal: TrJournalEnum.FXA_MOVE,
            details: [{ _id: 'detail', fixedAssetId: 'asset', count: 2 }],
            extraData: { fxaOwnerRecords: [] },
          },
        ],
      },
    }),
  );
  render(
    <FxaOwnerRecordsSheet
      form={result.current}
      journalIndex={0}
      detailIndex={0}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.change(screen.getByLabelText('new-owner'), {
    target: { value: 'new-owner' },
  });
  expect(screen.getByText('old-owner')).toBeDefined();
  expect(screen.getByLabelText('new-owner')).toHaveProperty(
    'value',
    'new-owner',
  );
  const saved = fxaOwnerRecordInputSchema.parse(
    result.current.getValues('trDocs.0.extraData.fxaOwnerRecords.0'),
  );
  expect(saved).toMatchObject({
    ownerId: 'new-owner',
    sourceOwnerId: 'old-owner',
    fxaOwnerRecordId: 'asset:old-owner',
    count: 2,
  });
  expect(useQuery).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      variables: expect.objectContaining({ excludeTransactionId: 'move' }),
    }),
  );
});

test('disposal keeps the existing source-only custodian selector', () => {
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        trDocs: [
          {
            journal: TrJournalEnum.FXA_OUT,
            details: [{ _id: 'detail', fixedAssetId: 'asset', count: 2 }],
            extraData: { fxaOwnerRecords: [] },
          },
        ],
      },
    }),
  );
  render(
    <FxaOwnerRecordsSheet
      form={result.current}
      journalIndex={0}
      detailIndex={0}
    />,
  );
  expect(screen.queryByLabelText('new-owner')).toBeNull();
});
