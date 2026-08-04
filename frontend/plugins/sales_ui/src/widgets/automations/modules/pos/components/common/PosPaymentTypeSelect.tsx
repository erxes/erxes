import { useGetPos } from '@/pos/hooks/useGetPos';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('sales');
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
        <Select.Value placeholder={t('any-payment')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={EMPTY_PAYMENT_TYPE}>{t('any-payment')}</Select.Item>
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
