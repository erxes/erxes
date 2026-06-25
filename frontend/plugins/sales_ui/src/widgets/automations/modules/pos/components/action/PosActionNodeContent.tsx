import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import {
  POS_CUSTOMER_TYPE_OPTIONS,
  POS_ORDER_STATUS_OPTIONS,
  POS_ORDER_TYPE_OPTIONS,
} from '../../constants/configForm';
import { TPosOrderActionConfigForm } from '../../states/posOrderActionConfigFormDefinitions';

const OPTION_GROUPS: Partial<
  Record<
    keyof TPosOrderActionConfigForm,
    Array<{ value: string; label: string }>
  >
> = {
  status: POS_ORDER_STATUS_OPTIONS,
  type: POS_ORDER_TYPE_OPTIONS,
  customerType: POS_CUSTOMER_TYPE_OPTIONS,
};

const getContent = (
  key: keyof TPosOrderActionConfigForm,
  value: string | undefined,
) => {
  const options = OPTION_GROUPS[key];

  return options?.find((option) => option.value === value)?.label || value;
};

export const PosActionNodeContent = ({
  config,
}: AutomationActionNodeConfigProps<TPosOrderActionConfigForm>) => {
  const { t } = useTranslation('sales');

  const LABELS: Partial<Record<keyof TPosOrderActionConfigForm, string>> = {
    posId: t('pos-id'),
    status: t('status'),
    type: t('order-type'),
    customerId: t('customer'),
    customerType: t('customer-type'),
    productIds: t('products'),
  };

  return (
    <div>
      {Object.entries(config || {})
        .filter(([key, value]) => {
          const typedKey = key as keyof TPosOrderActionConfigForm;

          return Boolean(LABELS[typedKey] && value);
        })
        .map(([key, value]) => (
          <AutomationNodeMetaInfoRow
            key={key}
            fieldName={LABELS[key as keyof TPosOrderActionConfigForm] || key}
            content={getContent(
              key as keyof TPosOrderActionConfigForm,
              String(value),
            )}
          />
        ))}
    </div>
  );
};
