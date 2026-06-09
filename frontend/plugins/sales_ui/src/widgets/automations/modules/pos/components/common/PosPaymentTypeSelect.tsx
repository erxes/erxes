import { useGetPos } from '@/pos/hooks/useGetPos';
import { Select } from 'erxes-ui';

const EMPTY_PAYMENT_TYPE = '__any_payment__';

export const PosPaymentTypeSelect = ({
  posId,
  value,
  onChange,
}: {
  posId?: string;
  value?: string;
  onChange: (value: string) => void;
}) => {
  const { pos = [] } = useGetPos({
    variables: { perPage: 1000 },
  });
  const targetPosList = posId ? pos.filter((item) => item._id === posId) : pos;
  const paymentTypes = targetPosList
    .flatMap((item) => item.paymentTypes || [])
    .filter(
      (paymentType, index, array) =>
        paymentType.type &&
        array.findIndex((item) => item.type === paymentType.type) === index,
    );
  const currentValue = value || '';
  const hasCurrentValue =
    currentValue &&
    !paymentTypes.some((paymentType) => paymentType.type === currentValue);

  return (
    <Select
      value={value || EMPTY_PAYMENT_TYPE}
      onValueChange={(selectedValue) =>
        onChange(selectedValue === EMPTY_PAYMENT_TYPE ? '' : selectedValue)
      }
    >
      <Select.Trigger>
        <Select.Value placeholder="Any payment" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={EMPTY_PAYMENT_TYPE}>Any payment</Select.Item>
        {hasCurrentValue && (
          <Select.Item value={currentValue}>{currentValue}</Select.Item>
        )}
        {paymentTypes.map((paymentType) => (
          <Select.Item key={paymentType.type} value={paymentType.type}>
            {paymentType.title || paymentType.type}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
