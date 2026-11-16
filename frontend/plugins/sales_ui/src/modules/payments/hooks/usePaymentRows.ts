import { nanoid } from 'nanoid';
import { useState } from 'react';
import {
  Control,
  FieldArray,
  FieldArrayPath,
  FieldValues,
  useFieldArray,
} from 'react-hook-form';
import { PaymentConfigItem } from '../types';
import { useLoyaltyPaymentWallets } from './useLoyaltyPaymentWallets';

// The key a wallet row gets when it is added; the server gives the same.
const walletPaymentType = (accountTypeId: string) => `loyalty_${accountTypeId}`;

/**
 * One `paymentTypes` list holds both kinds of rows: money rows typed by
 * hand, and wallet rows the Loyalty section adds and removes by wallet.
 */
export const usePaymentRows = <TFieldValues extends FieldValues>(
  control: Control<TFieldValues>,
) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'paymentTypes' as FieldArrayPath<TFieldValues>,
  });
  const rows = fields as unknown as (PaymentConfigItem & { id: string })[];
  const { enabled, wallets, loading } = useLoyaltyPaymentWallets();

  const walletIds = rows
    .map(({ accountTypeId }) => accountTypeId)
    .filter((id): id is string => !!id);
  // Turned on with nothing chosen yet still shows the wallet picker.
  const [pickerOpen, setPickerOpen] = useState(false);

  const toRow = (row: PaymentConfigItem) =>
    row as unknown as FieldArray<TFieldValues, FieldArrayPath<TFieldValues>>;

  const setWallets = (ids: string[]) =>
    replace([
      ...rows.filter((row) => !row.accountTypeId),
      ...ids.map((accountTypeId) => {
        const kept = rows.find((row) => row.accountTypeId === accountTypeId);

        return (
          kept || {
            _id: nanoid(),
            type: walletPaymentType(accountTypeId),
            title: wallets.find(({ _id }) => _id === accountTypeId)?.name || '',
            icon: '',
            accountTypeId,
          }
        );
      }),
    ].map(toRow));

  const setLoyaltyOn = (on: boolean) => {
    setPickerOpen(on);

    if (!on) {
      setWallets([]);
    }
  };

  return {
    moneyRows: rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !row.accountTypeId),
    addMoneyRow: () =>
      append(
        toRow({ _id: nanoid(), type: '', title: '', icon: '', config: '' }),
      ),
    removeRow: remove,
    loyalty: {
      enabled,
      on: pickerOpen || walletIds.length > 0,
      setOn: setLoyaltyOn,
      walletIds,
      setWallets,
      wallets,
      loading,
    },
  };
};
