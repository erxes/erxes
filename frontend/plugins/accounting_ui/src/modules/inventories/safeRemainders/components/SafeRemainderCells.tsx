import { Row } from '@tanstack/react-table';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  INumberFieldContainerProps,
  NumberField,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';

type ItemFieldProps = INumberFieldContainerProps & {
  remItem: ISafeRemainderItem;
};

export const SafeRemainderProductCell = ({
  row,
}: {
  row: Row<ISafeRemainderItem>;
}) => (
  <RecordTableInlineCell>
    {`${row.original.product?.code} - ${row.original.product?.name}`}
  </RecordTableInlineCell>
);

export const SafeRemainderNumberCell = ({ value }: { value: number }) => (
  <RecordTableInlineCell>
    <CurrencyFormatedDisplay
      currencyValue={{ currencyCode: CurrencyCode.MNT, amountMicros: value }}
    />
  </RecordTableInlineCell>
);

export const SafeRemainderCountField = ({
  value,
  _id,
  remItem,
}: ItemFieldProps) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-count`}
      onSave={(remainder) =>
        editRemItem(
          {
            variables: { _id: remItem._id, remainder, status: 'checked' },
          },
        )
      }
      className="bg-yellow-50 shadow-none rounded-none px-2 dark:bg-yellow-500/10"
    />
  );
};

export const SafeRemainderDifferenceField = ({
  value,
  _id,
  remItem,
}: ItemFieldProps) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-difference`}
      onSave={(difference) =>
        editRemItem(
          {
            variables: {
              _id: remItem._id,
              remainder: remItem.preCount + difference,
              status: 'checked',
            },
          },
        )
      }
      className="shadow-none rounded-none px-2"
    />
  );
};
