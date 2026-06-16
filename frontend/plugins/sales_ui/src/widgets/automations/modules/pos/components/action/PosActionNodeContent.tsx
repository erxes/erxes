import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
} from 'ui-modules';
import {
  POS_CUSTOMER_TYPE_OPTIONS,
  POS_ORDER_STATUS_OPTIONS,
  POS_ORDER_TYPE_OPTIONS,
} from '../../constants/configForm';
import { TPosOrderActionConfigForm } from '../../states/posOrderActionConfigFormDefinitions';

const LABELS: Partial<Record<keyof TPosOrderActionConfigForm, string>> = {
  posId: 'POS ID',
  status: 'Status',
  type: 'Order type',
  customerId: 'Customer',
  customerType: 'Customer type',
  productIds: 'Products',
};

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
